using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Clientes;
using PetCareServicios.Services.Interfaces;
using System.Net.Http.Json;

namespace PetCareServicios.Services
{
    public class ClienteService : IClienteService
    {
        private readonly ClienteDbContext _context;
        private readonly IMapper _mapper;
        private readonly HttpClient _httpClient;
        private readonly string _authServiceUrl;

        public ClienteService(
            ClienteDbContext context, 
            IMapper mapper,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _httpClient = httpClient;
            _authServiceUrl = configuration["Services:AuthServiceUrl"] ?? "http://localhost:5043/api/auth";
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
            var responses = _mapper.Map<List<ClienteResponse>>(clientes);
            
            // Enriquecer cada respuesta con datos del usuario
            foreach (var response in responses)
            {
                await EnriquecerConDatosDelUsuarioAsync(response);
            }
            
            return responses;
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

        /// <summary>
        /// Enriquece la respuesta de cliente con datos del usuario desde auth-service
        /// </summary>
        private async Task EnriquecerConDatosDelUsuarioAsync(ClienteResponse clienteResponse)
        {
            try
            {
                // Llamar a auth-service para obtener datos del usuario
                var url = $"{_authServiceUrl}/users/{clienteResponse.UsuarioID}";
                Console.WriteLine($"🔗 Obteniendo datos del usuario desde: {url}");
                
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    var userInfo = await response.Content.ReadFromJsonAsync<UserInfoDto>();
                    
                    if (userInfo != null)
                    {
                        clienteResponse.NombreUsuario = userInfo.Name ?? string.Empty;
                        clienteResponse.EmailUsuario = userInfo.Email ?? string.Empty;
                        Console.WriteLine($"✅ Datos del usuario enriquecidos: {userInfo.Name} ({userInfo.Email})");
                    }
                }
                else
                {
                    Console.WriteLine($"⚠️ Auth-service respondió con status {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                // Si auth-service no responde, usamos valores por defecto
                Console.WriteLine($"❌ Error al obtener datos del usuario desde auth-service: {ex.Message}");
            }
        }

        /// <summary>
        /// DTO para recibir datos del usuario desde auth-service
        /// </summary>
        private class UserInfoDto
        {
            public int Id { get; set; }
            public string? Name { get; set; }
            public string? Email { get; set; }
            public string? PhoneNumber { get; set; }
            public string? UserName { get; set; }
        }
    }
} 