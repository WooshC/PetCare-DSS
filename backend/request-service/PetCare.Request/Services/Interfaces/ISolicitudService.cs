using PetCareServicios.Models.Solicitudes;

namespace PetCareServicios.Services.Interfaces
{
    public interface ISolicitudService
    {
        Task<List<SolicitudResponse>> GetAllSolicitudesAsync(string? authToken = null);
        Task<SolicitudResponse?> GetSolicitudByIdAsync(int id, string? authToken = null); 
        Task<List<SolicitudResponse>> GetSolicitudesByClienteAsync(int clienteId, string? authToken = null);
        Task<List<SolicitudResponse>> GetSolicitudesByCuidadorAsync(int cuidadorId, string? authToken = null); 
        Task<List<SolicitudResponse>> GetSolicitudesByEstadoAsync(string estado, string? authToken = null); 
        
        // Los demás métodos se mantienen igual
        Task<SolicitudResponse> CreateSolicitudAsync(int clienteId, SolicitudRequest request, string? authToken = null);

        Task<SolicitudResponse?> UpdateSolicitudAsync(int id, SolicitudRequest request);
        Task<SolicitudResponse?> UpdateSolicitudEstadoAsync(int id, SolicitudEstadoRequest request);
        Task<SolicitudResponse?> AsignarCuidadorAsync(int id, AsignarCuidadorRequest request, string? authToken = null);
        Task<bool> DeleteSolicitudAsync(int id);
        Task<bool> CancelarSolicitudAsync(int id);
        Task<bool> AceptarSolicitudAsync(int id);
        Task<bool> RechazarSolicitudAsync(int id);
        Task<bool> IniciarServicioAsync(int id);
        Task<bool> FinalizarServicioAsync(int id);
        
        Task<bool> MarkAsPaidAsync(int id);
        Task<bool> MarkAsRatedAsync(int id);
    }
}