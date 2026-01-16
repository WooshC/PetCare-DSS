using PetCareServicios.Models.Clientes;

namespace PetCareServicios.Services.Interfaces
{
    public interface IClienteService
    {
        Task<ClienteResponse?> GetByUsuarioIdAsync(int usuarioId);
        Task<ClienteResponse?> GetByIdAsync(int clienteId);
        Task<List<ClienteResponse>> GetAllAsync();
        Task<ClienteResponse> CreateAsync(int usuarioId, ClienteRequest request, string nombreUsuario, string emailUsuario);
        Task<ClienteResponse?> UpdateAsync(int usuarioId, ClienteRequest request);
        Task<bool> DeleteAsync(int usuarioId);
        Task<bool> VerifyDocumentoAsync(int clienteId);
    }
} 