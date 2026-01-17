using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Clientes;
using PetCare.Shared;

namespace PetCareServicios.Data
{
    public class ClienteDbContext : DbContext
    {
        public ClienteDbContext(DbContextOptions<ClienteDbContext> options) : base(options) { }

        public DbSet<Cliente> Clientes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(e => e.ClienteID);
                entity.Property(e => e.ClienteID).ValueGeneratedOnAdd();
                entity.HasIndex(e => e.DocumentoIdentidad);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.UsuarioID).IsUnique();
                entity.Property(e => e.Estado).HasDefaultValue("Activo").HasMaxLength(20);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
            });

            // Configuración de AuditLog
            modelBuilder.Entity<AuditLog>(entity =>
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