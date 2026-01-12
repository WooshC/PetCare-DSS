using System.Security.Claims;

namespace PetCareServicios.Models.Auth
{
    /// <summary>
    /// DTO para información de usuario (sin datos sensibles)
    /// </summary>
    public class InformacionUsuario
    {
        /// <summary>
        /// ID único del usuario
        /// </summary>
        public int Identificador { get; set; }

        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        public string Correo { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del usuario
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Número de teléfono del usuario
        /// </summary>
        public string Telefono { get; set; } = string.Empty;

        /// <summary>
        /// Identificador del arrendador al que pertenece el usuario
        /// </summary>
        public string IdentificadorArrendador { get; set; } = string.Empty;

        /// <summary>
        /// Fecha de creación de la cuenta
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Lista de roles del usuario
        /// </summary>
        public List<string> Roles { get; set; } = new();

        /// <summary>
        /// Indica si MFA está habilitado para este usuario
        /// </summary>
        public bool MFAHabilitado { get; set; }
    }

    // Mantener alias para compatibilidad hacia atrás
    public class UserInfo : InformacionUsuario 
    {
        public int Id { get => Identificador; set => Identificador = value; }
        public string Email { get => Correo; set => Correo = value; }
        public string Name { get => Nombre; set => Nombre = value; }
        public string PhoneNumber { get => Telefono; set => Telefono = value; }
        public DateTime CreatedAt { get => FechaCreacion; set => FechaCreacion = value; }
    }
}