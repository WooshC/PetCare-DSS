using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MinLength(2)]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Phone(ErrorMessage = "El formato del teléfono es inválido")]
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder 15 caracteres")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Cliente|Cuidador|Admin)$", ErrorMessage = "El rol debe ser 'Cliente', 'Cuidador' o 'Admin'")]
        public string Role { get; set; } = "Cliente";
    }
}