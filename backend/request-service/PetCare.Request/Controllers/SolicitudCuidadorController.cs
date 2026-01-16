using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using PetCareServicios.Models.Solicitudes;
using PetCareServicios.Services.Interfaces;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Cuidador")]
    public class SolicitudCuidadorController : ControllerBase
    {
        private readonly ISolicitudService _solicitudService;

        public SolicitudCuidadorController(ISolicitudService solicitudService)
        {
            _solicitudService = solicitudService;
        }

        // GET: api/solicitudcuidador/mis-solicitudes
        [HttpGet("mis-solicitudes")]
        public async Task<ActionResult<List<SolicitudResponse>>> GetMisSolicitudes()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var solicitudes = await _solicitudService.GetSolicitudesByCuidadorAsync(currentUserId);
                return Ok(solicitudes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // GET: api/solicitudcuidador/{id}
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

                // Verificar que la solicitud está asignada al cuidador actual
                var currentUserId = GetCurrentUserId();
                if (solicitud.CuidadorID != currentUserId)
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

        // POST: api/solicitudcuidador/{id}/aceptar
        [HttpPost("{id}/aceptar")]
        public async Task<ActionResult> AceptarSolicitud(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud está asignada al cuidador actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.CuidadorID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.AceptarSolicitudAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Solicitud aceptada exitosamente" });
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

        // POST: api/solicitudcuidador/{id}/rechazar
        [HttpPost("{id}/rechazar")]
        public async Task<ActionResult> RechazarSolicitud(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud está asignada al cuidador actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.CuidadorID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.RechazarSolicitudAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Solicitud rechazada exitosamente" });
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

        // POST: api/solicitudcuidador/{id}/iniciar-servicio
        [HttpPost("{id}/iniciar-servicio")]
        public async Task<ActionResult> IniciarServicio(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud está asignada al cuidador actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.CuidadorID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.IniciarServicioAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Servicio iniciado exitosamente" });
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

        // POST: api/solicitudcuidador/{id}/finalizar-servicio
        [HttpPost("{id}/finalizar-servicio")]
        public async Task<ActionResult> FinalizarServicio(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                
                // Verificar que la solicitud está asignada al cuidador actual
                var existingSolicitud = await _solicitudService.GetSolicitudByIdAsync(id);
                if (existingSolicitud == null)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }
                
                if (existingSolicitud.CuidadorID != currentUserId)
                {
                    return Forbid();
                }

                var result = await _solicitudService.FinalizarServicioAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Solicitud no encontrada" });
                }

                return Ok(new { message = "Servicio finalizado exitosamente" });
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
    }
} 