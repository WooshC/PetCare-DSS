using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Data
{
    public class CuidadorDbContext : DbContext
    {
        public CuidadorDbContext(DbContextOptions<CuidadorDbContext> options) : base(options)
        {
        }

        public DbSet<Cuidador> Cuidadores { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configuraciones del modelo Cuidador
            builder.Entity<Cuidador>(entity =>
            {
                entity.HasKey(e => e.CuidadorID);
                entity.Property(e => e.CuidadorID).ValueGeneratedOnAdd();
                
                entity.Property(e => e.DocumentoIdentidad)
                    .IsRequired()
                    .HasMaxLength(20);
                
                entity.Property(e => e.TelefonoEmergencia)
                    .HasMaxLength(15);
                
                entity.Property(e => e.Biografia)
                    .HasColumnType("TEXT");
                
                entity.Property(e => e.Experiencia)
                    .HasColumnType("TEXT");
                
                entity.Property(e => e.HorarioAtencion)
                    .HasMaxLength(100);
                
                entity.Property(e => e.TarifaPorHora)
                    .HasColumnType("DECIMAL(10,2)");
                
                entity.Property(e => e.CalificacionPromedio)
                    .HasColumnType("DECIMAL(3,2)")
                    .HasDefaultValue(0.0m);
                
                entity.Property(e => e.Estado)
                    .HasMaxLength(20)
                    .HasDefaultValue("Activo");
                
                entity.Property(e => e.FechaCreacion)
                    .HasDefaultValueSql("GETUTCDATE()");
                
                // Índices para mejorar performance
                entity.HasIndex(e => e.UsuarioID).IsUnique();
                entity.HasIndex(e => e.DocumentoIdentidad);
                entity.HasIndex(e => e.Estado);
            });
        }
    }
} 