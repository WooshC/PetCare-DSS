using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Clientes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Services
{
    public class ClienteService : IClienteService
    {
        private readonly ClienteDbContext _context;
        private readonly IMapper _mapper;

        public ClienteService(ClienteDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ClienteResponse?> GetByUsuarioIdAsync(int usuarioId)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.UsuarioID == usuarioId && c.Estado == "Activo");
            return cliente == null ? null : _mapper.Map<ClienteResponse>(cliente);
        }

        public async Task<ClienteResponse?> GetByIdAsync(int clienteId)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.ClienteID == clienteId && c.Estado == "Activo");
            return cliente == null ? null : _mapper.Map<ClienteResponse>(cliente);
        }

        public async Task<List<ClienteResponse>> GetAllAsync()
        {
            var clientes = await _context.Clientes.Where(c => c.Estado == "Activo").ToListAsync();
            return _mapper.Map<List<ClienteResponse>>(clientes);
        }

        public async Task<ClienteResponse> CreateAsync(int usuarioId, ClienteRequest request, string nombreUsuario, string emailUsuario)
        {
            if (await _context.Clientes.AnyAsync(c => c.UsuarioID == usuarioId && c.Estado == "Activo"))
                throw new InvalidOperationException("El usuario ya tiene un perfil de cliente activo.");
            if (await _context.Clientes.AnyAsync(c => c.DocumentoIdentidad == request.DocumentoIdentidad && c.Estado == "Activo"))
                throw new InvalidOperationException("El documento de identidad ya está registrado.");
            var cliente = new Cliente
            {
                ClienteID = usuarioId, // ClienteID igual a UsuarioID
                UsuarioID = usuarioId,
                DocumentoIdentidad = request.DocumentoIdentidad,
                TelefonoEmergencia = request.TelefonoEmergencia,
                DocumentoVerificado = false,
                FechaCreacion = DateTime.UtcNow,
                Estado = "Activo"
            };
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return _mapper.Map<ClienteResponse>(cliente);
        }

        public async Task<ClienteResponse?> UpdateAsync(int usuarioId, ClienteRequest request)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.UsuarioID == usuarioId && c.Estado == "Activo");
            if (cliente == null) return null;
            cliente.DocumentoIdentidad = request.DocumentoIdentidad;
            cliente.TelefonoEmergencia = request.TelefonoEmergencia;
            cliente.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return _mapper.Map<ClienteResponse>(cliente);
        }

        public async Task<bool> DeleteAsync(int usuarioId)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.UsuarioID == usuarioId && c.Estado == "Activo");
            if (cliente == null) return false;
            cliente.Estado = "Eliminado";
            cliente.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerifyDocumentoAsync(int clienteId)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.ClienteID == clienteId && c.Estado == "Activo");
            if (cliente == null) return false;
            cliente.DocumentoVerificado = true;
            cliente.FechaVerificacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 