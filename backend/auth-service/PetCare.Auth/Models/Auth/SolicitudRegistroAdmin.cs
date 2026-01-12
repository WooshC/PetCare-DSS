using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    /// <summary>
    /// Solicitud para que un Admin registre un nuevo usuario
    /// </summary>
    public class SolicitudRegistroAdmin
    {
        /// <summary>
        /// Correo electrónico del nuevo usuario
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico es inválido")]
        public string Correo { get; set; } = string.Empty;

        /// <summary>
        /// Contraseña del nuevo usuario
        /// </summary>
        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$",
            ErrorMessage = "La contraseña debe contener minúsculas, mayúsculas y números")]
        public string Contraseña { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del nuevo usuario
        /// </summary>
        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MinLength(2, ErrorMessage = "El nombre debe tener al menos 2 caracteres")]
        [MaxLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Número de teléfono del nuevo usuario
        /// </summary>
        [Required(ErrorMessage = "El teléfono es obligatorio")]
        [Phone(ErrorMessage = "El formato del teléfono es inválido")]
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder 15 caracteres")]
        public string Telefono { get; set; } = string.Empty;

        /// <summary>
        /// Rol del usuario (Cliente, Cuidador, Admin)
        /// Nota: Solo Admins pueden crear otros Admins
        /// </summary>
        [Required(ErrorMessage = "El rol es obligatorio")]
        [RegularExpression("^(Cliente|Cuidador|Admin)$", ErrorMessage = "El rol debe ser 'Cliente', 'Cuidador' o 'Admin'")]
        public string Rol { get; set; } = "Cliente";
    }

    /// <summary>
    /// Solicitud para cambiar el rol de un usuario
    /// </summary>
    public class SolicitudCambioRol
    {
        /// <summary>
        /// ID del usuario cuyo rol será cambiado
        /// </summary>
        [Required(ErrorMessage = "El ID del usuario es obligatorio")]
        public int IdUsuario { get; set; }

        /// <summary>
        /// Nuevo rol (Cliente, Cuidador, Admin)
        /// </summary>
        [Required(ErrorMessage = "El nuevo rol es obligatorio")]
        [RegularExpression("^(Cliente|Cuidador|Admin)$", ErrorMessage = "El rol debe ser 'Cliente', 'Cuidador' o 'Admin'")]
        public string NuevoRol { get; set; } = string.Empty;
    }

    /// <summary>
    /// Respuesta estándar para operaciones de admin
    /// </summary>
    public class RespuestaOperacionAdmin
    {
        /// <summary>
        /// Indica si la operación fue exitosa
        /// </summary>
        public bool Exitosa { get; set; }

        /// <summary>
        /// Mensaje descriptivo de la operación
        /// </summary>
        public string Mensaje { get; set; } = string.Empty;

        /// <summary>
        /// Datos adicionales de la operación (ej: usuario creado)
        /// </summary>
        public object? Datos { get; set; }
    }
}
