using System.ComponentModel.DataAnnotations;

namespace PetCareServicios.Models.Solicitudes
{
    public class UserInfoDto
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        
        public string? UserName { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public List<string> Roles { get; set; } = new List<string>();
    }
}