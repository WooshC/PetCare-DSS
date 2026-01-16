using PetCareServicios.Models.Cuidadores;

namespace PetCareServicios.Services.Interfaces
{
    public interface ICuidadorService
    {
        Task<List<CuidadorResponse>> GetAllCuidadoresAsync();
        Task<CuidadorResponse?> GetCuidadorByIdAsync(int id);
        Task<CuidadorResponse?> GetCuidadorByUsuarioIdAsync(int usuarioId, string? token = null);
        Task<CuidadorResponse> CreateCuidadorAsync(int usuarioId, CuidadorRequest request);
        Task<CuidadorResponse?> UpdateCuidadorAsync(int id, CuidadorRequest request);
        Task<bool> DeleteCuidadorAsync(int id);
        Task<bool> VerificarDocumentoAsync(int id);
        Task<bool> UpdateRatingAsync(int id, decimal averageRating);
    }
}