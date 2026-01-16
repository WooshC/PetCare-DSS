using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCare.Payment.Data;
using PetCare.Payment.Models;
using PetCare.Payment.Services;
using System.Security.Claims;

namespace PetCare.Payment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentDbContext _context;
        private readonly PayPalService _payPalService;
        private readonly EncryptionService _encryptionService;

        public PaymentController(PaymentDbContext context, PayPalService payPalService, EncryptionService encryptionService)
        {
            _context = context;
            _payPalService = payPalService;
            _encryptionService = encryptionService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] PaymentRequest request)
        {
            try
            {
                var result = await _payPalService.CreateOrder(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("cards")]
        public async Task<IActionResult> SaveCard([FromBody] SaveCardRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // 1. Mask the number for display (keep last 4)
            var last4 = request.CardNumber.Length > 4 
                ? request.CardNumber.Substring(request.CardNumber.Length - 4) 
                : request.CardNumber;

            // 2. Encrypt the full number
            var encrypted = _encryptionService.Encrypt(request.CardNumber);

            // 3. Save
            var entity = new CreditCardEntity
            {
                UserId = userId,
                CardHolderName = request.CardHolderName,
                ExpirationDate = request.ExpirationDate,
                MaskedNumber = $"************{last4}",
                EncryptedCardNumber = encrypted,
                CreatedAt = DateTime.UtcNow
            };

            _context.CreditCards.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tarjeta guardada seguramente", id = entity.Id, masked = entity.MaskedNumber });
        }

        [Authorize]
        [HttpGet("cards")]
        public IActionResult GetMyCards()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var cards = _context.CreditCards
                .Where(c => c.UserId == userId)
                .Select(c => new 
                { 
                    c.Id, 
                    c.CardHolderName, 
                    c.MaskedNumber, 
                    c.ExpirationDate 
                })
                .ToList();

            return Ok(cards);
        }
    }
}
