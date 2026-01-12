using System.Security.Claims;

namespace PetCareServicios.Models.Auth
{
    /// <summary>
    /// DTO para información de usuario (sin datos sensibles)
    /// </summary>
    public class UserInfo
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}