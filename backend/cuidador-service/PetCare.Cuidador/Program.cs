using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Data;
using PetCareServicios.Services;
using PetCareServicios.Services.Interfaces;
using PetCareServicios.Config;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configurar la carga de archivos de configuración según el entorno
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
Console.WriteLine($"🔧 Entorno detectado: {environment}");

// Cargar configuración específica del entorno
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

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "PetCare Cuidador API", 
        Version = "v1",
        Description = "API para gestión de perfiles de cuidadores"
    });
    
    // Configurar autenticación JWT en Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
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

Console.WriteLine("🔧 Registrando controladores...");

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configuración de JWT
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

// Configuración de DbContext
builder.Services.AddDbContext<CuidadorDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default") 
        ?? throw new InvalidOperationException("No se encontró connection string configurada");
    
    options.UseSqlServer(connectionString);
    
    Console.WriteLine($"🔗 Connection string cargada:");
    Console.WriteLine($"   Server: {connectionString.Split(';').FirstOrDefault(s => s.StartsWith("Server="))?.Replace("Server=", "")}");
    Console.WriteLine($"   Database: {connectionString.Split(';').FirstOrDefault(s => s.StartsWith("Database="))?.Replace("Database=", "")}");
    Console.WriteLine($"   User: {connectionString.Split(';').FirstOrDefault(s => s.StartsWith("User Id="))?.Replace("User Id=", "")}");
    Console.WriteLine($"🔧 Entorno de configuración: {builder.Environment.EnvironmentName}");
});

// Configurar AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Registrar servicios
builder.Services.AddHttpClient();
builder.Services.AddScoped<ICuidadorService, CuidadorService>();

// Desactivar logs verbosos de HttpClient
builder.Logging.AddFilter("System.Net.Http.HttpClient", Microsoft.Extensions.Logging.LogLevel.Warning);

var app = builder.Build();

// Configurar URLs para Docker
if (app.Environment.EnvironmentName == "Docker")
{
    app.Urls.Clear();
    app.Urls.Add("http://0.0.0.0:8080");
}

Console.WriteLine("🚀 Aplicación construida, iniciando configuración...");

// Configure the HTTP request pipeline.
// Habilitar Swagger en todos los entornos para desarrollo
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== APLICACIÓN DE MIGRACIONES Y LOGS =====

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    try
    {
        Console.WriteLine("🔄 Iniciando aplicación de migraciones...");
        
        // Obtener el contexto de cuidador
        var cuidadorContext = services.GetRequiredService<CuidadorDbContext>();

        // Aplicar migraciones con reintentos
        int maxRetries = 5;
        int currentRetry = 0;
        
        while (currentRetry < maxRetries)
        {
            try
            {
                Console.WriteLine($"📊 Aplicando migraciones a CuidadorDbContext (intento {currentRetry + 1}/{maxRetries})...");
                
                // Aplicar migraciones directamente (crea la BD si no existe)
                await cuidadorContext.Database.MigrateAsync();
                Console.WriteLine($"✅ Migraciones aplicadas exitosamente a CuidadorDbContext");
                break; // Salir del bucle si es exitoso
            }
            catch (Exception ex)
            {
                currentRetry++;
                Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló: {ex.Message}");
                
                if (currentRetry >= maxRetries)
                {
                    throw; // Re-lanzar la excepción si se agotaron los intentos
                }
                
                // Esperar antes del siguiente intento (tiempo progresivo)
                int waitTime = currentRetry * 3; // 3, 6, 9, 12 segundos
                Console.WriteLine($"⏳ Esperando {waitTime} segundos antes del siguiente intento...");
                await Task.Delay(waitTime * 1000);
            }
        }

        Console.WriteLine("🎉 Proceso de migraciones completado");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error general al aplicar migraciones: {ex.Message}");
        Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
    }
}

// ===== INICIO DE LA APLICACIÓN =====

Console.WriteLine("🚀 PetCare Cuidador Service iniciando...");
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
    Console.WriteLine("   📍 Esperado: http://localhost:5044");
    Console.WriteLine("   🔗 Swagger UI: http://localhost:5044/swagger");
}

app.Run();