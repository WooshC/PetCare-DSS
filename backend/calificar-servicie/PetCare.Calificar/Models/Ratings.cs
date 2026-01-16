using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace PetCare.Calificar.Models;

public class Ratings
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)] 
    public int CalificacionID { get; set; }
    public int RequestId { get; set; }  // ID de la solicitud completada
    public int? ClienteID { get; set; }  // ID del cliente que califica
    public int? CuidadorID { get; set; }  // ID del cuidador calificado
    public int Score { get; set; }  // 1 a 5 estrellas
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AppSettings
{
    public ServicesConfig Services { get; set; } = new ServicesConfig();
}

public class ServicesConfig
{
    public string SolicitudesServiceUrl { get; set; } = string.Empty;
    public string CuidadorServiceUrl { get; set; } = string.Empty;
}

public class SolicitudResponseDto
{
    public int SolicitudID { get; set; }
    public int? ClienteID { get; set; }
    public int? CuidadorID { get; set; }
    public DateTime? FechaFinalizacion { get; set; }
}
public class RatingUpdateRequest
{
    public decimal AverageRating { get; set; }
}
