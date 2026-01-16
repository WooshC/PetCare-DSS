using Microsoft.EntityFrameworkCore;
using AutoMapper;
using PetCareServicios.Data;
using PetCareServicios.Models.Solicitudes;
using PetCareServicios.Services.Interfaces;
using System.Net.Http;

namespace PetCareServicios.Services
{
    public class SolicitudService : ISolicitudService
    {
        private readonly RequestDbContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly HttpClient _httpClient;

        public SolicitudService(RequestDbContext context, IMapper mapper, IConfiguration configuration, IHttpContextAccessor httpContextAccessor, HttpClient httpClient)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _httpClient = httpClient;
        }

        public async Task<List<SolicitudResponse>> GetAllSolicitudesAsync(string? authToken = null)
        {
            var solicitudes = await _context.Solicitudes
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            var responses = _mapper.Map<List<SolicitudResponse>>(solicitudes);
            var enrichedResponses = new List<SolicitudResponse>();

            foreach (var response in responses)
            {
                enrichedResponses.Add(await EnrichSolicitudWithUserInfo(response, authToken));
            }

            return enrichedResponses;
        }

        public async Task<SolicitudResponse?> GetSolicitudByIdAsync(int id, string? authToken = null)
        {
            var solicitud = await _context.Solicitudes.FirstOrDefaultAsync(s => s.SolicitudID == id);
            if (solicitud == null) return null;

            var response = _mapper.Map<SolicitudResponse>(solicitud);
            return await EnrichSolicitudWithUserInfo(response, authToken);
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesByClienteAsync(int clienteId, string? authToken = null)
        {
            var solicitudes = await _context.Solicitudes
                .Where(s => s.ClienteID == clienteId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            var responses = _mapper.Map<List<SolicitudResponse>>(solicitudes);
            var enrichedResponses = new List<SolicitudResponse>();

            foreach (var response in responses)
            {
                enrichedResponses.Add(await EnrichSolicitudWithUserInfo(response, authToken));
            }

            return enrichedResponses;
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesByCuidadorAsync(int cuidadorId, string? authToken = null)
        {
            var solicitudes = await _context.Solicitudes
                .Where(s => s.CuidadorID == cuidadorId)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            var responses = _mapper.Map<List<SolicitudResponse>>(solicitudes);
            var enrichedResponses = new List<SolicitudResponse>();

            foreach (var response in responses)
            {
                enrichedResponses.Add(await EnrichSolicitudWithUserInfo(response, authToken));
            }

            return enrichedResponses;
        }

        public async Task<List<SolicitudResponse>> GetSolicitudesByEstadoAsync(string estado, string? authToken = null)
        {
            var solicitudes = await _context.Solicitudes
                .Where(s => s.Estado == estado)
                .OrderByDescending(s => s.FechaCreacion)
                .ToListAsync();

            var responses = _mapper.Map<List<SolicitudResponse>>(solicitudes);
            var enrichedResponses = new List<SolicitudResponse>();

            foreach (var response in responses)
            {
                enrichedResponses.Add(await EnrichSolicitudWithUserInfo(response, authToken));
            }

            return enrichedResponses;
        }

       public async Task<SolicitudResponse> CreateSolicitudAsync(int usuarioId, SolicitudRequest request, string? authToken = null)
{
    var solicitud = new Solicitud
    {
        ClienteID = usuarioId,
        CuidadorID = null,
        TipoServicio = request.TipoServicio,
        Descripcion = request.Descripcion,
        FechaHoraInicio = request.FechaHoraInicio,
        DuracionHoras = request.DuracionHoras,
        Ubicacion = request.Ubicacion,
        Estado = "Pendiente",
        FechaCreacion = DateTime.UtcNow
    };

    _context.Solicitudes.Add(solicitud);
    await _context.SaveChangesAsync();

    var response = _mapper.Map<SolicitudResponse>(solicitud);
    return await EnrichSolicitudWithUserInfo(response, authToken);
}


        public async Task<SolicitudResponse?> UpdateSolicitudAsync(int id, SolicitudRequest request)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return null;

            if (solicitud.Estado != "Pendiente")
                throw new InvalidOperationException("No se puede modificar una solicitud que no esté en estado Pendiente");

            solicitud.TipoServicio = request.TipoServicio;
            solicitud.Descripcion = request.Descripcion;
            solicitud.FechaHoraInicio = request.FechaHoraInicio;
            solicitud.DuracionHoras = request.DuracionHoras;
            solicitud.Ubicacion = request.Ubicacion;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<SolicitudResponse>(solicitud);
        }

        public async Task<SolicitudResponse?> UpdateSolicitudEstadoAsync(int id, SolicitudEstadoRequest request)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return null;

            solicitud.Estado = request.Estado;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            switch (request.Estado.ToLower())
            {
                case "aceptada":
                    solicitud.FechaAceptacion = DateTime.UtcNow;
                    break;
                case "en progreso":
                    solicitud.FechaInicioServicio = DateTime.UtcNow;
                    break;
                case "finalizada":
                    solicitud.FechaFinalizacion = DateTime.UtcNow;
                    break;
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<SolicitudResponse>(solicitud);
        }

        public async Task<SolicitudResponse?> AsignarCuidadorAsync(int id, AsignarCuidadorRequest request, string? authToken = null)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return null;

            if (solicitud.Estado != "Pendiente")
                throw new InvalidOperationException("Solo se puede asignar cuidador a solicitudes pendientes");

            if (!await ValidarCuidadorExisteAsync(request.CuidadorID, authToken))
                throw new InvalidOperationException($"El cuidador con ID {request.CuidadorID} no existe o no está activo");

            solicitud.CuidadorID = request.CuidadorID;
            solicitud.Estado = "Asignada";
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<SolicitudResponse>(solicitud);
        }

        public async Task<bool> DeleteSolicitudAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "Pendiente")
                throw new InvalidOperationException("No se puede eliminar una solicitud que no esté en estado Pendiente");

            _context.Solicitudes.Remove(solicitud);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelarSolicitudAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "Pendiente" && solicitud.Estado != "Asignada")
                throw new InvalidOperationException("No se puede cancelar una solicitud que ya esté en progreso o finalizada");

            solicitud.Estado = "Cancelada";
            solicitud.FechaActualizacion = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AceptarSolicitudAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "Asignada")
                throw new InvalidOperationException("Solo se puede aceptar una solicitud que esté asignada");

            solicitud.Estado = "Aceptada";
            solicitud.FechaAceptacion = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RechazarSolicitudAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "Asignada")
                throw new InvalidOperationException("Solo se puede rechazar una solicitud que esté asignada");

            solicitud.Estado = "Rechazada";
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IniciarServicioAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "Aceptada")
                throw new InvalidOperationException("Solo se puede iniciar un servicio que esté aceptado");

            solicitud.Estado = "En Progreso";
            solicitud.FechaInicioServicio = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> FinalizarServicioAsync(int id)
        {
            var solicitud = await _context.Solicitudes.FindAsync(id);
            if (solicitud == null) return false;

            if (solicitud.Estado != "En Progreso")
                throw new InvalidOperationException("Solo se puede finalizar un servicio que esté en progreso");

            solicitud.Estado = "Finalizada";
            solicitud.FechaFinalizacion = DateTime.UtcNow;
            solicitud.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Crear orden de pago automáticamente
            try
            {
                await CrearOrdenPagoAsync(solicitud);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error creando orden de pago para solicitud {id}: {ex.Message}");
                // No fallar la finalización si el pago falla
            }

            return true;
        }

        private async Task CrearOrdenPagoAsync(Solicitud solicitud)
        {
            try
            {
                // Obtener información del cuidador para calcular el monto
                var cuidadorInfo = await GetCuidadorExtraInfo(solicitud.CuidadorID ?? 0, GetAuthTokenFromHeader());
                if (cuidadorInfo == null)
                {
                    Console.WriteLine($"⚠️ No se pudo obtener información del cuidador {solicitud.CuidadorID}");
                    return;
                }

                // Calcular monto total: horas * tarifa por hora
                decimal montoTotal = solicitud.DuracionHoras * cuidadorInfo.TarifaPorHora;

                var paymentServiceUrl = _configuration["Services:PaymentServiceUrl"] ?? "http://localhost:5045";
                var paymentRequest = new
                {
                    solicitudID = solicitud.SolicitudID,
                    amount = montoTotal,
                    currency = "USD",
                    description = $"Servicio de {solicitud.TipoServicio} - {solicitud.DuracionHoras}h x ${cuidadorInfo.TarifaPorHora}/h",
                    returnUrl = $"{_configuration["Frontend:BaseUrl"]}/cliente/pagos/success",
                    cancelUrl = $"{_configuration["Frontend:BaseUrl"]}/cliente/pagos/cancel"
                };

                var response = await _httpClient.PostAsJsonAsync($"{paymentServiceUrl}/api/payment/create-order", paymentRequest);
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"✅ Orden de pago creada para solicitud {solicitud.SolicitudID}: {result}");
                }
                else
                {
                    Console.WriteLine($"❌ Error creando orden de pago: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Excepción creando orden de pago: {ex.Message}");
                throw;
            }
        }

        private async Task<SolicitudResponse> EnrichSolicitudWithUserInfo(SolicitudResponse response, string? authToken = null)
{
    try
    {
        if (string.IsNullOrEmpty(authToken))
            authToken = GetAuthTokenFromHeader();

        // Cliente (Auth)
        if (response.ClienteID.HasValue)
        {
            var clienteInfo = await GetUserInfo(response.ClienteID.Value, authToken);
            if (clienteInfo != null)
            {
                response.NombreCliente = clienteInfo.Name;
                response.EmailCliente = clienteInfo.Email;
                response.TelefonoCliente = clienteInfo.PhoneNumber ?? string.Empty;
            }
        }

        // Cuidador (Auth + Cuidador Service)
        if (response.CuidadorID.HasValue)
        {
            // Primero obtenemos info del cuidador para tener el UsuarioID correcto
            var cuidadorExtra = await GetCuidadorExtraInfo(response.CuidadorID.Value, authToken);
            
            if (cuidadorExtra != null)
            {
                response.TarifaPorHora = cuidadorExtra.TarifaPorHora;
                response.CalificacionPromedio = cuidadorExtra.CalificacionPromedio;
                
                // Ahora usamos el UsuarioID correcto para obtener datos de Auth
                var cuidadorAuth = await GetUserInfo(cuidadorExtra.UsuarioID, authToken);
                if (cuidadorAuth != null)
                {
                    response.NombreCuidador = cuidadorAuth.Name;
                    response.EmailCuidador = cuidadorAuth.Email;
                    response.TelefonoCuidador = cuidadorAuth.PhoneNumber ?? string.Empty;
                }
            }
        }

        return response;
    }
    catch
    {
        return response;
    }
}


        private async Task<UserInfoDto?> GetUserInfo(int userId, string? authToken)
        {
            try
            {
                var authServiceUrl = _configuration["Services:AuthServiceUrl"];
                using var request = new HttpRequestMessage(HttpMethod.Get, $"{authServiceUrl}/api/auth/users/{userId}");

                if (!string.IsNullOrEmpty(authToken))
                {
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
                }

                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                    return await response.Content.ReadFromJsonAsync<UserInfoDto>();

                return null;
            }
            catch
            {
                return null;
            }
        }

        private async Task<CuidadorExtraResponseDto?> GetCuidadorExtraInfo(int cuidadorId, string? authToken = null)
{
    try
    {
        var cuidadorServiceUrl = _configuration["Services:CuidadorServiceUrl"] ?? "http://localhost:5044";
        
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{cuidadorServiceUrl}/api/cuidador/{cuidadorId}");
        
        if (!string.IsNullOrEmpty(authToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
        }
        
        var response = await _httpClient.SendAsync(request);

        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<CuidadorExtraResponseDto>();
            Console.WriteLine($"✅ Cuidador {cuidadorId} info: TarifaPorHora = {result?.TarifaPorHora}");
            return result;
        }
        
        Console.WriteLine($"⚠️ Error obteniendo info del cuidador {cuidadorId}: {response.StatusCode}");
        return null;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Excepción obteniendo info del cuidador {cuidadorId}: {ex.Message}");
        return null;
    }
}


        private string? GetAuthTokenFromHeader()
        {
            var authHeader = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length);
            }
            return null;
        }

        private async Task<bool> ValidarCuidadorExisteAsync(int cuidadorId, string? authToken = null)
        {
            try
            {
                using var httpClient = new HttpClient();

                if (!string.IsNullOrEmpty(authToken))
                {
                    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authToken);
                }

                var cuidadorServiceUrl = _configuration["Services:CuidadorServiceUrl"] ?? "http://localhost:5044";
                var url = $"{cuidadorServiceUrl}/api/cuidador/{cuidadorId}/validar";

                var response = await httpClient.GetAsync(url);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}