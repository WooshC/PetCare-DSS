using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Auth
{
    public class User : IdentityUser<int>
    {
        /// <summary>
        /// Nombre completo del usuario
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Identificador único del arrendador/organización a la que pertenece el usuario
        /// Usado para multi-tenancy y segregación de datos
        /// </summary>
        public string IdentificadorArrendador { get; set; } = string.Empty;

        /// <summary>
        /// Fecha de creación de la cuenta en UTC
        /// </summary>
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indicador si MFA está habilitado para este usuario
        /// </summary>
        public bool MFAHabilitado { get; set; } = false;

        /// <summary>
        /// Clave secreta para TOTP (Time-based One-Time Password) - encriptada en BD
        /// </summary>
        public string? ClaveSecretaMFA { get; set; }

        /// <summary>
        /// Contador de intentos fallidos de login
        /// </summary>
        public int IntentosLoginFallidos { get; set; } = 0;

        /// <summary>
        /// Fecha del último intento fallido de login
        /// </summary>
        public DateTime? FechaUltimoIntentoFallido { get; set; }

        /// <summary>
        /// Indicador si la cuenta está bloqueada por seguridad
        /// </summary>
        public bool CuentaBloqueada { get; set; } = false;

        /// <summary>
        /// Fecha de bloqueo de la cuenta (si aplica)
        /// </summary>
        public DateTime? FechaBloqueo { get; set; }
    }
} 