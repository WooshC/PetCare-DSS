using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Auth;

namespace PetCareServicios.Data
{
    public class AuthDbContext : IdentityDbContext<User, UserRole, int>
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configuraciones adicionales del modelo si son necesarias
            builder.Entity<User>(entity =>
            {
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            builder.Entity<UserRole>(entity =>
            {
                entity.Property(e => e.Description).HasMaxLength(200);
            });
        }
    }
} 