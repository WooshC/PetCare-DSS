using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PetCare.Calificar.Data;
using System.Text;
using AutoMapper;
using PetCare.Calificar.Models;

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 🔧 CONFIGURACIÓN DEL ENTORNO
// ====================================================
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

// ====================================================
// 🧩 CONFIGURACIÓN DE SERVICIOS
// ====================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "PetCare Rating API",
        Version = "v1",
        Description = "API para gestión de calificaciones de cuidadores en PetCare"
    });

    // Configuración JWT en Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Usa el formato: 'Bearer {token}' para autenticarte",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
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
            Array.Empty<string>()
        }
    });
});

// ====================================================
// 🌍 CONFIGURAR CORS
// ====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ====================================================
// 🔐 CONFIGURAR JWT
// ====================================================
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

// ====================================================
// 💾 CONFIGURAR ENTITY FRAMEWORK CORE
// ====================================================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("No se encontró la cadena de conexión configurada.");

    options.UseSqlServer(connectionString);

    Console.WriteLine($"🔗 Connection string cargada:");
    Console.WriteLine($"   Server: {connectionString.Split(';').FirstOrDefault(s => s.StartsWith("Server="))?.Replace("Server=", "")}");
    Console.WriteLine($"   Database: {connectionString.Split(';').FirstOrDefault(s => s.StartsWith("Database="))?.Replace("Database=", "")}");
});

// ====================================================
// ⚙️ AUTO MAPPER (si lo usas)
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// ====================================================
// 🚀 CONSTRUIR APLICACIÓN
// ====================================================
// Registrar HttpClient para inyección
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();
// Configuración de AppSettings para inyección
builder.Services.Configure<AppSettings>(builder.Configuration);

var app = builder.Build();

if (app.Environment.EnvironmentName == "Docker")
{
    app.Urls.Clear();
    app.Urls.Add("http://0.0.0.0:8080");
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ====================================================
// 📊 MIGRACIONES AUTOMÁTICAS
// ====================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    try
    {
        Console.WriteLine("🔄 Iniciando aplicación de migraciones...");

        var dbContext = services.GetRequiredService<AppDbContext>();
        int maxRetries = 5;
        int currentRetry = 0;

        while (currentRetry < maxRetries)
        {
            try
            {
                Console.WriteLine($"📊 Aplicando migraciones (intento {currentRetry + 1}/{maxRetries})...");
                await dbContext.Database.MigrateAsync();
                Console.WriteLine("✅ Migraciones aplicadas correctamente a la base de datos Rating");
                break;
            }
            catch (Exception ex)
            {
                currentRetry++;
                Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló: {ex.Message}");

                if (currentRetry >= maxRetries)
                    throw;

                int waitTime = currentRetry * 3;
                Console.WriteLine($"⏳ Esperando {waitTime} segundos antes del siguiente intento...");
                await Task.Delay(waitTime * 1000);
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error general en migraciones: {ex.Message}");
        Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
    }
}

// ====================================================
// 🏁 INICIO DE LA APLICACIÓN
// ====================================================
Console.WriteLine("🚀 PetCare Rating Service iniciando...");
Console.WriteLine($"📊 Entorno: {app.Environment.EnvironmentName}");

foreach (var url in app.Urls)
{
    Console.WriteLine($"🌐 URL: {url}");
    Console.WriteLine($"   🔗 Swagger UI: {url}/swagger");
}

app.Run();

// ====================================================
