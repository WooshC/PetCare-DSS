using Microsoft.EntityFrameworkCore;
using PetCare.Payment.Data;
using PetCare.Payment.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


// Configurar la carga de archivos de configuración según el entorno
var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
Console.WriteLine($"🔧 Entorno detectado: {environment}");

if (environment == "Docker")
{
    builder.Configuration.AddJsonFile("appsettings.Docker.json", optional: false);
    Console.WriteLine("📁 Cargando configuración Docker");
}
else
{
    builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
    Console.WriteLine("📁 Cargando configuración local");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB Context
builder.Services.AddDbContext<PaymentDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Default");
    options.UseSqlServer(connectionString);
    Console.WriteLine($"🔗 Connection string cargada para Payment: {connectionString}");
});

// Services
builder.Services.AddHttpClient<PayPalService>();
builder.Services.AddSingleton<EncryptionService>();
builder.Services.AddScoped<PayPalService>(); // Scoped because it uses HttpClient factory

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// Auto migration with Retry Logic
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var db = services.GetRequiredService<PaymentDbContext>();
        var auditDb = services.GetRequiredService<PetCare.Shared.Data.AuditDbContext>();
        
        int maxRetries = 10;
        int currentRetry = 0;

        while (currentRetry < maxRetries)
        {
            try
            {
                Console.WriteLine($"📊 Inicializando BD Payment (intento {currentRetry + 1}/{maxRetries})...");
                db.Database.EnsureCreated(); // Mantenemos EnsureCreated como estaba originalmente
                Console.WriteLine("✅ PaymentDbContext inicializado");

                Console.WriteLine("📊 Migrando Auditoría...");
                // Intentamos migrar normal
                try { await auditDb.Database.MigrateAsync(); } catch { Console.WriteLine("⚠️ EF Migrate falló, usando SQL directo..."); }

                // FUERZA BRUTA: Crear tabla si no existe
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
                await db.Database.ExecuteSqlRawAsync(sql);
                Console.WriteLine("✅ Tabla AuditLogs asegurada (SQL Directo)");
                
                break;
            }
            catch (Exception ex)
            {
                currentRetry++;
                Console.WriteLine($"⚠️ Intento {currentRetry}/{maxRetries} falló: {ex.Message}");
                if (currentRetry >= maxRetries) throw;
                System.Threading.Thread.Sleep(5000);
            }
        }
    }
    catch (Exception ex)
    {
         Console.WriteLine($"❌ Error FATAL inicializando Payment DB: {ex.Message}");
    }
}

// Configure URLs for Docker
if (app.Environment.IsEnvironment("Docker"))
{
    app.Urls.Clear();
    app.Urls.Add("http://0.0.0.0:8080");
}

app.Run();
