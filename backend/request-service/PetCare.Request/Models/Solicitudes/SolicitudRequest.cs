using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Solicitudes
{
    public class SolicitudRequest
    {
        public int? ClienteID { get; set; }

        public int? CuidadorID { get; set; }

        [Required]
        [StringLength(50)]
        public string TipoServicio { get; set; } = string.Empty;

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public DateTime FechaHoraInicio { get; set; }

        [Required]
        [Range(1, 24)]
        public int DuracionHoras { get; set; }

        [Required]
        [StringLength(200)]
        public string Ubicacion { get; set; } = string.Empty;
    }

   public class SolicitudResponse
{
    public int SolicitudID { get; set; }
    public int? ClienteID { get; set; }
    public int? CuidadorID { get; set; }
    public string TipoServicio { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionHoras { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
    public DateTime? FechaAceptacion { get; set; }
    public DateTime? FechaInicioServicio { get; set; }
    public DateTime? FechaFinalizacion { get; set; }
    public bool IsPaid { get; set; }
    public bool IsRated { get; set; }

    // Información del cliente (desde Auth)
    public string NombreCliente { get; set; } = string.Empty;
    public string EmailCliente { get; set; } = string.Empty;
    public string TelefonoCliente { get; set; } = string.Empty;

    // Información del cuidador (Auth + Cuidadores)
    public string NombreCuidador { get; set; } = string.Empty;
    public string EmailCuidador { get; set; } = string.Empty;
    public string TelefonoCuidador { get; set; } = string.Empty;
    public decimal? TarifaPorHora { get; set; }
    public double? CalificacionPromedio { get; set; }
}


    public class SolicitudEstadoRequest
    {
        [Required]
        public string Estado { get; set; } = string.Empty;
    }

    public class AsignarCuidadorRequest
    {
        [Required]
        public int CuidadorID { get; set; }
    }

    public class UsuarioAuthResponseDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
}

    public class CuidadorExtraResponseDto
    {
        public int CuidadorID { get; set; }
        public int UsuarioID { get; set; } // Add this
        public string Biografia { get; set; } = string.Empty;
        public decimal TarifaPorHora { get; set; }
        public double CalificacionPromedio { get; set; }
    }

} 