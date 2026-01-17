using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Solicitudes;
using PetCare.Shared;

namespace PetCareServicios.Data
{
    public class RequestDbContext : DbContext
    {
        public RequestDbContext(DbContextOptions<RequestDbContext> options) : base(options)
        {
        }

        public DbSet<Solicitud> Solicitudes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configuración específica para la tabla Solicitudes
            builder.Entity<Solicitud>(entity =>
            {
                entity.HasKey(e => e.SolicitudID);
                entity.Property(e => e.SolicitudID).ValueGeneratedOnAdd();
                
                // Configurar índices para mejorar el rendimiento
                entity.HasIndex(e => e.ClienteID);
                entity.HasIndex(e => e.CuidadorID);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.FechaHoraInicio);
                entity.HasIndex(e => e.FechaCreacion);
            });

            // Configuración de AuditLog
            builder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.UserId).HasMaxLength(100);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EntityName).HasMaxLength(200);
                entity.Property(e => e.EntityId).HasMaxLength(100);
                entity.Property(e => e.IpAddress).HasMaxLength(45);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
} 