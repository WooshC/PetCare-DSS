using Microsoft.EntityFrameworkCore;
using PetCare.Calificar.Models;

namespace PetCare.Calificar.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Ratings> Ratings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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
