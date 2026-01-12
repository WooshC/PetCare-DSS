using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    /// <summary>
    /// Solicitud para registrar un nuevo Admin del sistema
    /// Solo Admins autenticados pueden usar este endpoint
    /// </summary>
    public class AdminRegisterRequest
    {
        /// <summary>
        /// Correo electrónico del nuevo Admin
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico es inválido")]
        public string Correo { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña con mínimo 8 caracteres, debe incluir números y letras mayúsculas
        /// </summary>
        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$", 
            ErrorMessage = "La contraseña debe contener minúsculas, mayúsculas y números")]
        public string Contraseña { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del nuevo Admin
        /// </summary>
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MinLength(2, ErrorMessage = "El nombre debe tener al menos 2 caracteres")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Número de teléfono de contacto
        /// </summary>
        [Required(ErrorMessage = "El teléfono es obligatorio")]
        [Phone(ErrorMessage = "El formato del teléfono es inválido")]
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder 15 caracteres")]
        public string Telefono { get; set; } = string.Empty;
    }
}
