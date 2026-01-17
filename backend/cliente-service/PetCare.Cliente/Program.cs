using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Config;
using PetCareServicios.Data;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configuración de entorno y archivos de configuración
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
Console.WriteLine($"🔧 Entorno detectado: {environment}");

if (environment == "Docker")
{
    builder.Configuration.AddJsonFile("appsettings.Docker.json", optional: true);
    Console.WriteLine("📁 Cargando configuración Docker");
}
else
{
    builder.Configuration.AddJsonFile("appsettings.json", optional: true);
    Console.WriteLine("📁 Cargando configuración local");
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "PetCare.Cliente API", Version = "v1" });
    // JWT Bearer en Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// DbContext
builder.Services.AddDbContext<ClienteDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("No se encontró connection string configurada");
    options.UseSqlServer(connectionString);
    Console.WriteLine($"🔗 Connection string cargada: {connectionString}");
});

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key no configurada")))
    };
});

// Servicios
builder.Services.AddHttpClient();
builder.Services.AddScoped<IClienteService, ClienteService>();

var app = builder.Build();

// Configurar URLs para Docker
if (app.Environment.EnvironmentName == "Docker")
{
    app.Urls.Clear();
    app.Urls.Add("http://0.0.0.0:8080"); // Docker expone en 5009 externo
}

// Middleware
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Aplicar migraciones automáticas con feedback
// Aplicar migraciones automáticas con reintentos robustos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        Console.WriteLine("🔄 Iniciando aplicación de migraciones...");
        var db = services.GetRequiredService<ClienteDbContext>();
        var auditDb = services.GetRequiredService<PetCare.Shared.Data.AuditDbContext>();

        int maxRetries = 10; // Aumentamos a 10 para dar suficiente tiempo al SQL Server
        int currentRetry = 0;

        while (currentRetry < maxRetries)
        {
            try
            {
                Console.WriteLine($"📊 Aplicando migraciones (intento {currentRetry + 1}/{maxRetries})...");
                
                // 1. Migrar ClienteDB
                await db.Database.MigrateAsync();
                Console.WriteLine("✅ Migraciones aplicadas exitosamente a ClienteDbContext");

                // 2. Migrar AuditDB
                Console.WriteLine("📊 Aplicando migraciones a AuditDbContext...");
                try { await auditDb.Database.MigrateAsync(); } catch { Console.WriteLine("⚠️ EF Migrate falló, usando SQL directo..."); }

                // FUERZA BRUTA
                string sql = @"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
                BEGIN
                    CREATE TABLE [AuditLogs] (
                        [Id] uniqueidentifier NOT NULL PRIMARY KEY,
                        [UserId] nvarchar(100) NULL,
                        [Action] nvarchar(100) NOT NULL,
                        [EntityName] nvarchar(200) NOT NULL,
                        [EntityId] nvarchar(max) NULL,
                        [Timestamp] datetime2 NOT NULL,
                        [OldValues] nvarchar(max) NULL,
                        [NewValues] nvarchar(max) NULL,
                        [IpAddress] nvarchar(max) NULL,
                        [UserAgent] nvarchar(max) NULL
                    );
                END";
                await db.Database.ExecuteSqlRawAsync(sql); // Ejecutamos sobre db principal
                Console.WriteLine("✅ Tabla AuditLogs asegurada (SQL Directo)");

                break; // Éxito total
            }
            catch (Exception ex)
            {
                currentRetry++;
                Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló: {ex.Message}");
                
                if (currentRetry >= maxRetries) throw; // Rendirse

                int waitTime = 5; // Espera fija de 5 segundos es más predecible que exponencial para inicio de contenedores
                Console.WriteLine($"⏳ Esperando {waitTime} segundos antes del siguiente intento...");
                System.Threading.Thread.Sleep(waitTime * 1000); // Bloqueo sincrono aceptable en startup
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error FATAL al aplicar migraciones: {ex.Message}");
        // No lanzamos (throw) para permitir que el contenedor siga vivo y pueda reintentar manualmente si se desea,
        // aunque lo ideal en prod es que muera. Para desarrollo, mejor ver el log.
    }
}

// ===== INICIO DE LA APLICACIÓN =====

Console.WriteLine("🚀 PetCare Cliente Service iniciando...");
Console.WriteLine($"📊 Entorno: {app.Environment.EnvironmentName}");

// Mostrar URLs configuradas
var urls = app.Urls.ToList();
if (urls.Any())
{
    Console.WriteLine("🌐 URLs configuradas:");
    foreach (var url in urls)
    {
        Console.WriteLine($"   📍 {url}");
        if (url.Contains("localhost"))
        {
            Console.WriteLine($"   🔗 Swagger UI: {url}/swagger");
        }
    }
}
else
{
    Console.WriteLine("🌐 URLs: Se configurarán automáticamente al iniciar");
    Console.WriteLine("   📍 Esperado: http://localhost:5045");
    Console.WriteLine("   🔗 Swagger UI: http://localhost:5045/swagger");
}

app.Run();
