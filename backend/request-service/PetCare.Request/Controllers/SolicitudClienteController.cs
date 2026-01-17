using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PetCareServicios.Models.Solicitudes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Cliente")]
    public class SolicitudClienteController : ControllerBase
    {
        private readonly ISolicitudService _solicitudService;

        public SolicitudClienteController(ISolicitudService solicitudService)
        {
            _solicitudService = solicitudService;
        }

        // GET: api/solicitudcliente/mis-solicitudes
        [HttpGet("mis-solicitudes")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetMisSolicitudes()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var solicitudes = await _solicitudService.GetSolicitudesByClienteAsync(currentUserId);
                return Ok(solicitudes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // GET: api/solicitudcliente/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SolicitudResponse>> GetSolicitud(int id)
        {
            try
            {
                var solicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (solicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                // Verificar que la solicitud pertenece al cliente actual
                var currentUserId = GetCurrentUserId();
                if (solicitud.ClienteID != currentUserId)
                {
                    return Forbid();
                }

                return Ok(solicitud);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost]
public async Task<ActionResult<SolicitudResponse>> CreateSolicitud([FromBody] SolicitudRequest request)
{
    try
    {
        var currentUserId = GetCurrentUserId();
        var authToken = GetAuthTokenFromHeader();
        var solicitud = await _solicitudService.CreateSolicitudAsync(currentUserId, request, authToken);
        
        return CreatedAtAction(nameof(GetSolicitud), new { id = solicitud.SolicitudID }, solicitud);
    }
    catch (InvalidOperationException ex)
    {
        // Esto maneja errores de validación (por ejemplo, pagos pendientes)
        return BadRequest(new { message = ex.Message });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
    }
}

        // PUT: api/solicitudcliente/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<SolicitudResponse>> UpdateSolicitud(int id, [FromBody] SolicitudRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud pertenece al cliente actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.ClienteID != currentUserId)
                {
                    return Forbid();
                }

                var solicitud = await _solicitudService.UpdateSolicitudAsync(id, request);
                if (solicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(solicitud);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // PUT: api/solicitudcliente/{id}/asignar-cuidador
        [HttpPut("{id}/asignar-cuidador")]
        public async Task<ActionResult<SolicitudResponse>> AsignarCuidador(int id, [FromBody] AsignarCuidadorRequest request)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud pertenece al cliente actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.ClienteID != currentUserId)
                {
                    return Forbid();
                }

                // Extraer el token JWT del header de autorización
                var authToken = GetAuthTokenFromHeader();

                var solicitud = await _solicitudService.AsignarCuidadorAsync(id, request, authToken);
                if (solicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(solicitud);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // DELETE: api/solicitudcliente/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSolicitud(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud pertenece al cliente actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.ClienteID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.DeleteSolicitudAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // POST: api/solicitudcliente/{id}/marcar-calificada
        [HttpPost("{id}/marcar-calificada")]
        public async Task<ActionResult> MarcarCalificada(int id)
        {
            try
            {
                var result = await _solicitudService.MarkAsRatedAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Solicitud marcada como calificada exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // POST: api/solicitudcliente/{id}/cancelar
        [HttpPost("{id}/cancelar")]
        public async Task<ActionResult> CancelarSolicitud(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud pertenece al cliente actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.ClienteID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.CancelarSolicitudAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Solicitud cancelada exitosamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // Método auxiliar para obtener el ID del usuario actual
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new InvalidOperationException("Usuario no autenticado o ID de usuario inválido");
        }

        // Método auxiliar para extraer el token JWT del header de autorización
        private string? GetAuthTokenFromHeader()
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length);
            }
            return null;
        }
    }
} 