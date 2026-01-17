using Microsoft.EntityFrameworkCore;
using PetCare.Calificar.Models;
using PetCare.Shared;

namespace PetCare.Calificar.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Ratings> Ratings { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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

            modelBuilder.Entity<Ratings>().ToTable("Ratings");

            modelBuilder.Entity<Ratings>()
                .Property(r => r.Score)
                .IsRequired();

            modelBuilder.Entity<Ratings>()
                .Property(r => r.CreatedAt)
                .HasDefaultValueSql("GETDATE()");
        }
    }
}
