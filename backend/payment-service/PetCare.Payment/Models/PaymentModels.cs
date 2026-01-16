using System.ComponentModel.DataAnnotations;

namespace PetCare.Payment.Models
{
    public class CreditCardEntity
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string EncryptedCardNumber { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string MaskedNumber { get; set; } = string.Empty; // e.g., ************1234
        public string ExpirationDate { get; set; } = string.Empty; // MM/YY
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class SaveCardRequest
    {
        public string CardNumber { get; set; } = string.Empty;
        public string CardHolderName { get; set; } = string.Empty;
        public string ExpirationDate { get; set; } = string.Empty;
        public string CVV { get; set; } = string.Empty; // Not stored, just for validation simulation
    }

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string Description { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string CancelUrl { get; set; } = string.Empty;
    }
}
