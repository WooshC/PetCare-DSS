using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Solicitudes;

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
        }
    }
} 