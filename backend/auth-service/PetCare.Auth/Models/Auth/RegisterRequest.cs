using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class SolicitudRegistro
    {
        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico es inválido")]
        public string Correo { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña con mínimo 8 caracteres, debe incluir números y letras mayúsculas
        /// </summary>
        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};:'""\\|,.<>\/?]{8,}$", 
            ErrorMessage = "La contraseña debe contener minúsculas, mayúsculas y números")]
        public string Contraseña { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del usuario
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

        /// <summary>
        /// Identificador del arrendador/organización del usuario
        /// Permite multi-tenancy y segregación de datos
        /// </summary>
        [Required(ErrorMessage = "El identificador de arrendador es obligatorio")]
        [StringLength(100, ErrorMessage = "El identificador de arrendador no puede exceder 100 caracteres")]
        [RegularExpression(@"^[a-zA-Z0-9_-]+$", ErrorMessage = "El identificador de arrendador solo puede contener letras, números, guiones y guiones bajos")]
        public string IdentificadorArrendador { get; set; } = string.Empty;

        /// <summary>
        /// Rol del usuario en el sistema (Cliente, Cuidador)
        /// NOTA: Para crear Admins, usar /api/admin/register con token Admin válido
        /// </summary>
        [Required(ErrorMessage = "El rol es obligatorio")]
        [RegularExpression("^(Cliente|Cuidador)$", ErrorMessage = "El rol debe ser 'Cliente' o 'Cuidador'. Para crear Admins, use /api/admin/register")]
        public string Rol { get; set; } = "Cliente";
    }

    // Mantener alias para compatibilidad hacia atrás
    public class RegisterRequest : SolicitudRegistro { }
}