using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class SolicitudLogin
    {
        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico es inválido")]
        public string Correo { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña del usuario
        /// </summary>
        [Required(ErrorMessage = "La contraseña es obligatoria")]
        public string Contraseña { get; set; } = string.Empty;

        /// <summary>
        /// Identificador del arrendador - requerido para multi-tenancy
        /// </summary>
        [Required(ErrorMessage = "El identificador de arrendador es obligatorio")]
        [StringLength(100, ErrorMessage = "El identificador de arrendador no puede exceder 100 caracteres")]
        public string IdentificadorArrendador { get; set; } = string.Empty;
    }

    // Mantener alias para compatibilidad hacia atrás
    public class LoginRequest : SolicitudLogin { }
} 