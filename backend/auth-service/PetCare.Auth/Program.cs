using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Models.Auth;
using PetCareServicios.Data;
using PetCareServicios.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configurar la carga de archivos de configuración según el entorno
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
Console.WriteLine($"🔧 Entorno detectado: {environment}");

// Cargar configuración específica del entorno
if (environment == "Docker")
{
    builder.Configuration.AddJsonFile("appsettings.Docker.json", optional: false);
    Console.WriteLine("📁 Cargando configuración Docker");
}
else
{
    builder.Configuration.AddJsonFile("appsettings.json", optional: false);
    Console.WriteLine("📁 Cargando configuración local");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Configuración de Identity
builder.Services.AddIdentity<User, UserRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AuthDbContext>()
.AddDefaultTokenProviders();

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

// Configuración simple de DbContext
// Configuración simple de DbContext
builder.Services.AddDbContext<AuthDbContext>(options =>
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

// Registrar AuditDbContext usando la misma conexión (o una diferente si se prefiere)
builder.Services.AddDbContext<PetCare.Shared.Data.AuditDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default") 
        ?? throw new InvalidOperationException("No se encontró connection string configurada para Auditoría");
    options.UseSqlServer(connectionString);
});

// Registrar servicios
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PetCare.Shared.IAuditService, PetCare.Shared.AuditService>();

var app = builder.Build();

// Configurar URLs para Docker
if (app.Environment.EnvironmentName == "Docker")
{
    app.Urls.Clear();
    app.Urls.Add("http://0.0.0.0:8080");
}

Console.WriteLine("Aplicación construida, iniciando configuración...");

// Configure the HTTP request pipeline.
// Habilitar Swagger en todos los entornos para desarrollo
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<PetCare.Shared.AuditMiddleware>();

app.MapControllers();

// ===== APLICACIÓN DE MIGRACIONES Y LOGS =====

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    try
    {
        Console.WriteLine("Iniciando aplicación de migraciones...");
        
        // Obtener el contexto de autenticación
        var authContext = services.GetRequiredService<AuthDbContext>();

        // Aplicar migraciones con reintentos
        int maxRetries = 5;
        int currentRetry = 0;
        
        while (currentRetry < maxRetries)
        {
            try
            {
                Console.WriteLine($"📊 Aplicando migraciones a AuthDbContext (intento {currentRetry + 1}/{maxRetries})...");
                
                // Aplicar migraciones directamente (crea la BD si no existe)
                await authContext.Database.MigrateAsync();
                Console.WriteLine($"✅ Migraciones aplicadas exitosamente a AuthDbContext");

                // Migrar Auditoría
                var auditContext = services.GetRequiredService<PetCare.Shared.Data.AuditDbContext>();
                Console.WriteLine("📊 Aplicando migraciones a AuditDbContext...");
                await auditContext.Database.MigrateAsync();
                Console.WriteLine($"✅ Migraciones aplicadas exitosamente a AuditDbContext");
                
                break; // Salir del bucle si es exitoso
            }
            catch (Exception ex)
            {
                currentRetry++;
                Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló: {ex.Message}");
                // ... same retry logic ...
                
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

        // Crear roles por defecto si no existen
        try
        {
            Console.WriteLine("👥 Creando roles por defecto...");
            var roleManager = services.GetRequiredService<RoleManager<UserRole>>();
            var roles = new[] { "Admin", "Cliente", "Cuidador" };
            
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new UserRole { Name = role, Description = $"Rol de {role}" });
                    Console.WriteLine($"✅ Rol '{role}' creado");
                }
                else
                {
                    Console.WriteLine($"ℹ️ Rol '{role}' ya existe");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error al crear roles: {ex.Message}");
        }

        Console.WriteLine("Proceso de migraciones completado");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error general al aplicar migraciones: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
    }
}

// ===== INICIO DE LA APLICACIÓN =====

Console.WriteLine("PetCare Auth Service iniciando...");
Console.WriteLine($"Entorno: {app.Environment.EnvironmentName}");

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
    Console.WriteLine("Esperado: http://localhost:5043");
    Console.WriteLine("Swagger UI: http://localhost:5043/swagger");
}

app.Run();

