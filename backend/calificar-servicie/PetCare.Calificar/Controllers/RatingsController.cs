using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PetCare.Calificar.Data;
using PetCare.Calificar.Models;
using System.Net.Http.Json;
using System.Security.Claims;

namespace PetCare.Calificar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _solicitudesServiceUrl;
        private readonly string _cuidadorServiceUrl;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RatingsController(
            AppDbContext context, 
            HttpClient httpClient, 
            IOptions<AppSettings> config,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpClient = httpClient;
            _solicitudesServiceUrl = config.Value.Services.SolicitudesServiceUrl;
            _cuidadorServiceUrl = config.Value.Services.CuidadorServiceUrl;
            _httpContextAccessor = httpContextAccessor;
        }

        [Authorize(Roles = "Cliente")]
[HttpPost]
public async Task<ActionResult<Ratings>> PostRating(Ratings rating)
{
    try
    {
        // Obtener el token JWT del contexto actual
        var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
        
        if (string.IsNullOrEmpty(token))
            return Unauthorized("Token de autorización no encontrado");

        Console.WriteLine($"🔐 Token obtenido: {token.Substring(0, Math.Min(50, token.Length))}...");

        // Configurar el HttpClient con el token
        using var request = new HttpRequestMessage(HttpMethod.Get, $"{_solicitudesServiceUrl}/{rating.RequestId}");
        request.Headers.Add("Authorization", token);
        request.Headers.Add("Accept", "application/json");

        Console.WriteLine($"🌐 Llamando a: {_solicitudesServiceUrl}/{rating.RequestId}");

        var response = await _httpClient.SendAsync(request);
        
        Console.WriteLine($"📡 Respuesta recibida: {response.StatusCode}");

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                return BadRequest("La solicitud no existe");
            
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"❌ Error del servicio: {errorContent}");
            return StatusCode(500, $"Error al comunicarse con el servicio de solicitudes: {response.StatusCode}");
        }

        var solicitud = await response.Content.ReadFromJsonAsync<SolicitudResponseDto>();
        if (solicitud == null)
            return BadRequest("No se pudo obtener la información de la solicitud");

        Console.WriteLine($"📋 Solicitud obtenida - ClienteID: {solicitud.ClienteID}, FechaFinalizacion: {solicitud.FechaFinalizacion}");

        // Validar que el servicio esté finalizado
        if (solicitud.FechaFinalizacion == null)
            return BadRequest("El servicio aún no ha finalizado");

        // Validar que solo el cliente que hizo la solicitud puede calificar
        var clienteIdDelToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"👤 Cliente del token: {clienteIdDelToken}, Cliente de la solicitud: {solicitud.ClienteID}");

        if (solicitud.ClienteID?.ToString() != clienteIdDelToken)
            return Forbid("Solo el cliente que solicitó el servicio puede calificarlo");

        // Validar que no exista ya una calificación para esta solicitud
        var existingRating = await _context.Ratings
            .FirstOrDefaultAsync(r => r.RequestId == rating.RequestId);
        
        if (existingRating != null)
            return BadRequest("Ya existe una calificación para esta solicitud");

        // 🔧 IMPORTANTE: Asegurar que el ID sea 0 para que la BD lo genere automáticamente
        rating.CalificacionID = 0;
        rating.CreatedAt = DateTime.UtcNow;
        
        // 🔄 ASIGNAR DATOS DESDE LA SOLICITUD (Más fiable que el body del front)
        rating.ClienteID = solicitud.ClienteID;
        rating.CuidadorID = solicitud.CuidadorID;

        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync();

        Console.WriteLine($"✅ Calificación guardada en BD - ID: {rating.CalificacionID}, Cliente: {rating.ClienteID}, Cuidador: {rating.CuidadorID}, Score: {rating.Score}");

        // 🚀 ACTUALIZAR EL PROMEDIO EN EL SERVICIO DE CUIDADOR
        if (rating.CuidadorID.HasValue)
        {
            try
            {
                var average = await _context.Ratings
                    .Where(r => r.CuidadorID == rating.CuidadorID)
                    .AverageAsync(r => (decimal)r.Score);

                Console.WriteLine($"📊 Nuevo promedio calculado para Cuidador {rating.CuidadorID}: {average}");

                var updateRatingDto = new RatingUpdateRequest { AverageRating = average };
                
                var updateRequest = new HttpRequestMessage(HttpMethod.Put, $"{_cuidadorServiceUrl}/{rating.CuidadorID}/rating");
                updateRequest.Headers.Add("Authorization", token);
                updateRequest.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                updateRequest.Content = JsonContent.Create(updateRatingDto);

                Console.WriteLine($"🌐 Enviando actualización a CuidadorService: {updateRequest.RequestUri}");

                var updateResponse = await _httpClient.SendAsync(updateRequest);
                if (updateResponse.IsSuccessStatusCode)
                {
                    Console.WriteLine($"✅ Promedio sincronizado exitosamente. Status: {updateResponse.StatusCode}");
                }
                else
                {
                     var responseBody = await updateResponse.Content.ReadAsStringAsync();
                    Console.WriteLine($"⚠️ Error al sincronizar con CuidadorService: {updateResponse.StatusCode}");
                    Console.WriteLine($"   Cuerpo respuesta: {responseBody}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error fatal al intentar sincronizar promedio: {ex.Message}");
                Console.WriteLine($"   Stack: {ex.StackTrace}");
            }
        }

        // 🚀 NUEVO: MARCAR COMO CALIFICADA EN REQUEST SERVICE
        try
        {
             // Usar PATCH o POST según el endpoint de Request Service para marcar como Rated
             // Asumiendo que existe un endpoint /api/solicitudcliente/{id}/calificar o similar, o usando un método interno si no existe.
             // Pero el RequestService tiene MarkAsRatedAsync en su servicio interno, necesitamos exponerlo en el controlador.
             // Como workaround rápido, si no existe endpoint, lo agregamos en el siguiente paso.
             // Asumiremos que vamos a crear el endpoint: POST /api/solicitudcliente/{id}/marcar-calificada

             var markRatedUrl = $"{_solicitudesServiceUrl}/{rating.RequestId}/marcar-calificada";
             var markRequest = new HttpRequestMessage(HttpMethod.Post, markRatedUrl);
             markRequest.Headers.Add("Authorization", token);

             Console.WriteLine($"🌐 Marcando solicitud como calificada: {markRatedUrl}");
             var markResponse = await _httpClient.SendAsync(markRequest);
             
             if (markResponse.IsSuccessStatusCode)
             {
                 Console.WriteLine($"✅ Solicitud {rating.RequestId} marcada como calificada.");
             }
             else
             {
                 Console.WriteLine($"⚠️ No se pudo marcar como calificada en RequestService: {markResponse.StatusCode}");
             }
        }
        catch (Exception ex)
        {
             Console.WriteLine($"❌ Error marcando solicitud como calificada: {ex.Message}");
        }

        return CreatedAtAction(nameof(GetRating), new { id = rating.CalificacionID }, rating);
    }
    catch (HttpRequestException ex)
    {
        Console.WriteLine($"🌐 Error de conexión: {ex.Message}");
        return StatusCode(503, $"Servicio de solicitudes no disponible: {ex.Message}");
    }
    catch (DbUpdateException ex)
    {
        Console.WriteLine($"💾 Error de base de datos: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"📋 Inner Exception: {ex.InnerException.Message}");
        }
        return StatusCode(500, "Error al guardar en la base de datos. Verifica que los datos sean válidos.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"💥 Error interno: {ex.Message}");
        Console.WriteLine($"📋 StackTrace: {ex.StackTrace}");
        return StatusCode(500, $"Error interno del servidor: {ex.Message}");
    }
}

        // DELETE: api/ratings/5
        [Authorize(Roles = "Cliente")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRating(int id)
        {
            var rating = await _context.Ratings.FindAsync(id);
            if (rating == null) return NotFound();

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ratings>>> GetRatings()
        {
            return await _context.Ratings.ToListAsync();
        }

        // GET: api/ratings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ratings>> GetRating(int id)
        {
            var rating = await _context.Ratings.FindAsync(id);
            if (rating == null) return NotFound();
            return rating;
        }

        // GET: api/ratings/cuidador/5
        [HttpGet("cuidador/{cuidadorId}")]
        public async Task<ActionResult<IEnumerable<Ratings>>> GetRatingsByCuidador(int cuidadorId)
        {
            var ratings = await _context.Ratings
                                        .Where(r => r.CuidadorID == cuidadorId)
                                        .ToListAsync();

            if (!ratings.Any()) return NotFound();
            return ratings;
        }

        // GET: api/ratings/cuidador/5/promedio
        [HttpGet("cuidador/{cuidadorId}/promedio")]
        public async Task<ActionResult<double>> GetPromedioByCuidador(int cuidadorId)
        {
            var ratings = await _context.Ratings
                                        .Where(r => r.CuidadorID == cuidadorId)
                                        .ToListAsync();

            if (!ratings.Any()) return 0;

            return ratings.Average(r => r.Score);
        }
    }
}


