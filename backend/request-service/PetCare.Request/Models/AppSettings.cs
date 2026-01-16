// En PetCareServicios/Models/AppSettings.cs
namespace PetCareServicios.Models
{
    public class AppSettings
    {
        public ServicesConfig Services { get; set; } = new ServicesConfig();
    }

    public class ServicesConfig
    {
        public string CuidadorServiceUrl { get; set; } = string.Empty;
        public string AuthServiceUrl { get; set; } = string.Empty;
    }
}