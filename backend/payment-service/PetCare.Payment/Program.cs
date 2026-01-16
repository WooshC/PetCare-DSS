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

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();

// Auto migration for demo purposes
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
