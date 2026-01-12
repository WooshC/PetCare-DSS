namespace PetCareServicios.Models.Auth
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public UserInfo? User { get; set; } 
        public string Message { get; set; } = string.Empty;
    }

    
} 