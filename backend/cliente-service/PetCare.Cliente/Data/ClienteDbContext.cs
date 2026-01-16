using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Clientes;

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
                entity.HasIndex(e => e.DocumentoIdentidad);
                entity.HasIndex(e => e.Estado);
                entity.HasIndex(e => e.UsuarioID).IsUnique();
                entity.Property(e => e.Estado).HasDefaultValue("Activo").HasMaxLength(20);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");
            });
        }
    }
} 