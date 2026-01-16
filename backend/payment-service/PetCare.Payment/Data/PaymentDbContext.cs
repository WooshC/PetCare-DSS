using Microsoft.EntityFrameworkCore;
using PetCare.Payment.Models;

namespace PetCare.Payment.Data
{
    public class PaymentDbContext : DbContext
    {
        public PaymentDbContext(DbContextOptions<PaymentDbContext> options) : base(options) { }

        public DbSet<CreditCardEntity> CreditCards { get; set; }
    }
}
