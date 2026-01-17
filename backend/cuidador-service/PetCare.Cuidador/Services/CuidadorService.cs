using Microsoft.EntityFrameworkCore;
using PetCareServicios.Data;
using PetCareServicios.Models.Cuidadores;
using PetCareServicios.Services.Interfaces;
using AutoMapper;
using System.Net.Http.Json;

namespace PetCareServicios.Services
{
    public class CuidadorService : ICuidadorService
    {
        private readonly CuidadorDbContext _context;
        private readonly IMapper _mapper;
        private readonly HttpClient _httpClient;
        private readonly string _ratingsServiceUrl;
        private readonly string _authServiceUrl;

        public CuidadorService(
            CuidadorDbContext context, 
            IMapper mapper, 
            HttpClient httpClient, 
            IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _httpClient = httpClient;
            _ratingsServiceUrl = configuration["Services:RatingsServiceUrl"] ?? "http://localhost:5075/api/ratings";
            _authServiceUrl = configuration["Services:AuthServiceUrl"] ?? "http://localhost:5043/api/auth";
        }

        public async Task<List<CuidadorResponse>> GetAllCuidadoresAsync()
        {
            var cuidadores = await _context.Cuidadores
                .Where(c => c.Estado == "Activo")
                .ToListAsync();

            var responses = _mapper.Map<List<CuidadorResponse>>(cuidadores);

            // Sincronizar calificaciones en paralelo
            var ratingTasks = cuidadores.Select(c => SyncRatingAsync(c));
            await Task.WhenAll(ratingTasks);
            
            // Enriquecer todas las respuestas con datos del usuario en paralelo
            var enrichmentTasks = responses.Select(response => EnriquecerConDatosDelUsuarioAsync(response, null));
            await Task.WhenAll(enrichmentTasks);

            return responses;
        }

        public async Task<CuidadorResponse?> GetCuidadorByIdAsync(int id)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == id && c.Estado == "Activo");

            if (cuidador != null)
            {
                // Sincronizar calificación bajo demanda
                await SyncRatingAsync(cuidador);
                
                // Mapear a response
                var response = _mapper.Map<CuidadorResponse>(cuidador);
                
                // Obtener datos del usuario desde auth-service (sin token)
                await EnriquecerConDatosDelUsuarioAsync(response, null);
                
                return response;
            }

            return null;
        }

        public async Task<CuidadorResponse?> GetCuidadorByUsuarioIdAsync(int usuarioId, string? token = null)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId && c.Estado == "Activo");

            if (cuidador != null)
            {
                // Sincronizar calificación bajo demanda
                await SyncRatingAsync(cuidador);
                
                // Mapear a response
                var response = _mapper.Map<CuidadorResponse>(cuidador);
                
                // Obtener datos del usuario desde auth-service con token si está disponible
                await EnriquecerConDatosDelUsuarioAsync(response, token);
                
                return response;
            }

            return null;
        }

        public async Task<CuidadorResponse> CreateCuidadorAsync(int usuarioId, CuidadorRequest request)
        {
            // Verificar que no exista ya un perfil para este usuario
            var existingCuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.UsuarioID == usuarioId);

            if (existingCuidador != null)
            {
                throw new InvalidOperationException("Ya existe un perfil de cuidador para este usuario");
            }

            // Verificar que el documento de identidad no esté duplicado
            var existingDocument = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.DocumentoIdentidad == request.DocumentoIdentidad);

            if (existingDocument != null)
            {
                throw new InvalidOperationException("El documento de identidad ya está registrado");
            }

            var cuidador = new Cuidador
            {
                CuidadorID = usuarioId, // CuidadorID igual a UsuarioID
                UsuarioID = usuarioId,
                DocumentoIdentidad = request.DocumentoIdentidad,
                TelefonoEmergencia = request.TelefonoEmergencia,
                Biografia = request.Biografia,
                Experiencia = request.Experiencia,
                HorarioAtencion = request.HorarioAtencion,
                TarifaPorHora = request.TarifaPorHora,
                Estado = "Activo",
                FechaCreacion = DateTime.UtcNow
            };

            _context.Cuidadores.Add(cuidador);
            await _context.SaveChangesAsync();

            return _mapper.Map<CuidadorResponse>(cuidador);
        }

        public async Task<CuidadorResponse?> UpdateCuidadorAsync(int id, CuidadorRequest request)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == id && c.Estado == "Activo");

            if (cuidador == null)
                return null;

            // Verificar que el documento de identidad no esté duplicado (si cambió)
            if (cuidador.DocumentoIdentidad != request.DocumentoIdentidad)
            {
                var existingDocument = await _context.Cuidadores
                    .FirstOrDefaultAsync(c => c.DocumentoIdentidad == request.DocumentoIdentidad && c.CuidadorID != id);

                if (existingDocument != null)
                {
                    throw new InvalidOperationException("El documento de identidad ya está registrado");
                }
            }

            // Actualizar propiedades
            cuidador.DocumentoIdentidad = request.DocumentoIdentidad;
            cuidador.TelefonoEmergencia = request.TelefonoEmergencia;
            cuidador.Biografia = request.Biografia;
            cuidador.Experiencia = request.Experiencia;
            cuidador.HorarioAtencion = request.HorarioAtencion;
            cuidador.TarifaPorHora = request.TarifaPorHora;
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<CuidadorResponse>(cuidador);
        }

        public async Task<bool> DeleteCuidadorAsync(int id)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == id && c.Estado == "Activo");

            if (cuidador == null)
                return false;

            // Soft delete - cambiar estado a "Eliminado"
            cuidador.Estado = "Eliminado";
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerificarDocumentoAsync(int id)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == id && c.Estado == "Activo");

            if (cuidador == null)
                return false;

            cuidador.DocumentoVerificado = true;
            cuidador.FechaVerificacion = DateTime.UtcNow;
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateRatingAsync(int id, decimal averageRating)
        {
            var cuidador = await _context.Cuidadores
                .FirstOrDefaultAsync(c => c.CuidadorID == id && c.Estado == "Activo");

            if (cuidador == null)
                return false;

            cuidador.CalificacionPromedio = Math.Round(averageRating, 2);
            cuidador.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Método privado para sincronizar la calificación desde el servicio de Ratings
        /// </summary>
        private async Task SyncRatingAsync(Cuidador cuidador)
        {
            try
            {
                var url = $"{_ratingsServiceUrl}/cuidador/{cuidador.CuidadorID}/promedio";
                var response = await _httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var averageRating = await response.Content.ReadFromJsonAsync<decimal>();
                    var roundedRating = Math.Round(averageRating, 2);

                    if (cuidador.CalificacionPromedio != roundedRating)
                    {
                        cuidador.CalificacionPromedio = roundedRating;
                        cuidador.FechaActualizacion = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"🔄 Rating sincronizado para Cuidador {cuidador.CuidadorID}: {roundedRating}");
                    }
                }
            }
            catch (Exception ex)
            {
                // Si el servicio de ratings está caído, fallamos silenciosamente usando el caché local
                Console.WriteLine($"⚠️ No se pudo sincronizar rating para Cuidador {cuidador.CuidadorID}: {ex.Message}");
            }
        }

        /// <summary>
        /// Enriquece la respuesta de cuidador con datos del usuario desde auth-service
        /// </summary>
        private async Task EnriquecerConDatosDelUsuarioAsync(CuidadorResponse cuidadorResponse, string? token = null)
        {
            try
            {
                // Llamar a auth-service para obtener datos del usuario
                var url = $"{_authServiceUrl}/users/{cuidadorResponse.UsuarioID}";
                Console.WriteLine($"🔗 Obteniendo datos del usuario desde: {url}");
                
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                
                // Si tenemos token, lo pasamos en el header Authorization
                if (!string.IsNullOrEmpty(token))
                {
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
                    Console.WriteLine($"🔐 Usando token para autenticación");
                }
                
                var response = await _httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    var userInfo = await response.Content.ReadFromJsonAsync<UserInfoDto>();
                    
                    if (userInfo != null)
                    {
                        cuidadorResponse.NombreUsuario = userInfo.Name ?? string.Empty;
                        cuidadorResponse.EmailUsuario = userInfo.Email ?? string.Empty;
                        cuidadorResponse.TelefonoUsuario = userInfo.PhoneNumber ?? string.Empty;
                        cuidadorResponse.CuentaBloqueada = userInfo.CuentaBloqueada;
                        Console.WriteLine($"✅ Datos del usuario enriquecidos: {userInfo.Name} ({userInfo.Email}) - Tel: {userInfo.PhoneNumber} - Bloqueada: {userInfo.CuentaBloqueada}");
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
            public bool CuentaBloqueada { get; set; }
        }
    }
}