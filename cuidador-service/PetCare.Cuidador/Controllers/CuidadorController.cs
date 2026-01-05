using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetCareServicios.Models.Cuidadores;
using PetCareServicios.Services.Interfaces;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para gestionar perfiles de cuidadores
    /// Maneja CRUD de cuidadores y operaciones específicas como verificación
    /// Requiere autenticación JWT para todas las operaciones
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CuidadorController : ControllerBase
    {
        private readonly ICuidadorService _cuidadorService;

        public CuidadorController(ICuidadorService cuidadorService)
        {
            _cuidadorService = cuidadorService;
        }

        /// <summary>
        /// Obtiene todos los cuidadores registrados
        /// Requiere autenticación (disponible para Cliente, Cuidador y Admin)
        /// </summary>
        /// <returns>Lista de todos los cuidadores</returns>
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<CuidadorResponse>>> GetAllCuidadores()
        {
            var cuidadores = await _cuidadorService.GetAllCuidadoresAsync();
            return Ok(cuidadores);
        }

        /// <summary>
        /// Obtiene un cuidador específico por ID
        /// Requiere autenticación (disponible para Cliente, Cuidador y Admin)
        /// </summary>
        /// <param name="id">ID del cuidador</param>
        /// <returns>Datos del cuidador o NotFound si no existe</returns>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<CuidadorResponse>> GetCuidador(int id)
        {
            var cuidador = await _cuidadorService.GetCuidadorByIdAsync(id);
            if (cuidador == null)
                return NotFound("Cuidador no encontrado");

            return Ok(cuidador);
        }

        /// <summary>
        /// Valida si un cuidador existe y está disponible para asignación
        /// Endpoint específico para validación desde otros servicios
        /// </summary>
        /// <param name="id">ID del cuidador</param>
        /// <returns>Datos del cuidador si está disponible</returns>
        [HttpGet("{id}/validar")]
        [Authorize]
        public async Task<ActionResult<CuidadorResponse>> ValidarCuidador(int id)
        {
            var cuidador = await _cuidadorService.GetCuidadorByIdAsync(id);
            if (cuidador == null)
                return NotFound("Cuidador no encontrado");

            // Validar que el cuidador esté activo y disponible
            if (cuidador.Estado != "Activo")
                return BadRequest($"El cuidador no está disponible. Estado actual: {cuidador.Estado}");

            // Opcional: Validar que tenga documento verificado
            if (!cuidador.DocumentoVerificado)
                return BadRequest("El cuidador no tiene documento verificado");

            return Ok(cuidador);
        }

        /// <summary>
        /// Obtiene el perfil del cuidador autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil de cuidador asociado
        /// 3. Retorna los datos del perfil
        /// </summary>
        /// <returns>Perfil del cuidador autenticado</returns>
        [HttpGet("mi-perfil")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<CuidadorResponse>> GetMiPerfil()
        {
            // Extraer ID del usuario del token JWT
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            // Buscar perfil de cuidador asociado al usuario
            var cuidador = await _cuidadorService.GetCuidadorByUsuarioIdAsync(usuarioId.Value);
            if (cuidador == null)
                return NotFound("No tienes un perfil de cuidador");

            return Ok(cuidador);
        }

        /// <summary>
        /// Crea un nuevo perfil de cuidador para el usuario autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Valida que no exista ya un perfil
        /// 3. Crea el perfil con los datos proporcionados
        /// 4. Retorna el perfil creado
        /// </summary>
        /// <param name="request">Datos del perfil de cuidador</param>
        /// <returns>Perfil creado o error si ya existe</returns>
        [HttpPost]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<CuidadorResponse>> CreateCuidador([FromBody] CuidadorRequest request)
        {
            try
            {
                // Extraer ID del usuario del token JWT
                var usuarioId = GetCurrentUserId();
                if (usuarioId == null)
                    return Unauthorized();

                // Crear perfil de cuidador
                var cuidador = await _cuidadorService.CreateCuidadorAsync(usuarioId.Value, request);
                return CreatedAtAction(nameof(GetCuidador), new { id = cuidador.CuidadorID }, cuidador);
            }
            catch (ArgumentException ex)
            {
                // Error de validación (usuario no encontrado, etc.)
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                // Error de conflicto (ya existe perfil)
                return Conflict(ex.Message);
            }
        }

        /// <summary>
        /// Actualiza un perfil de cuidador específico
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="id">ID del cuidador</param>
        /// <param name="request">Datos actualizados</param>
        /// <returns>Perfil actualizado o NotFound si no existe</returns>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CuidadorResponse>> UpdateCuidador(int id, [FromBody] CuidadorRequest request)
        {
            var cuidador = await _cuidadorService.UpdateCuidadorAsync(id, request);
            if (cuidador == null)
                return NotFound("Cuidador no encontrado");

            return Ok(cuidador);
        }

        /// <summary>
        /// Actualiza el perfil del cuidador autenticado
        /// FLUJO:
        /// 1. Extrae el ID del usuario del token JWT
        /// 2. Busca el perfil asociado
        /// 3. Actualiza con los nuevos datos
        /// 4. Retorna el perfil actualizado
        /// </summary>
        /// <param name="request">Datos actualizados del perfil</param>
        /// <returns>Perfil actualizado</returns>
        [HttpPut("mi-perfil")]
        [Authorize(Roles = "Cuidador")]
        public async Task<ActionResult<CuidadorResponse>> UpdateMiPerfil([FromBody] CuidadorRequest request)
        {
            // Extraer ID del usuario del token JWT
            var usuarioId = GetCurrentUserId();
            if (usuarioId == null)
                return Unauthorized();

            // Buscar perfil del usuario
            var miCuidador = await _cuidadorService.GetCuidadorByUsuarioIdAsync(usuarioId.Value);
            if (miCuidador == null)
                return NotFound("No tienes un perfil de cuidador");

            // Actualizar perfil
            var cuidador = await _cuidadorService.UpdateCuidadorAsync(miCuidador.CuidadorID, request);
            return Ok(cuidador);
        }

        /// <summary>
        /// Elimina un perfil de cuidador
        /// Requiere permisos de administrador
        /// </summary>
        /// <param name="id">ID del cuidador a eliminar</param>
        /// <returns>NoContent si se elimina exitosamente</returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo administradores pueden eliminar
        public async Task<ActionResult> DeleteCuidador(int id)
        {
            var result = await _cuidadorService.DeleteCuidadorAsync(id);
            if (!result)
                return NotFound("Cuidador no encontrado");

            return NoContent();
        }

        /// <summary>
        /// Marca el documento de un cuidador como verificado
        /// Requiere permisos de administrador
        /// FLUJO:
        /// 1. Busca el cuidador por ID
        /// 2. Marca el documento como verificado
        /// 3. Actualiza la fecha de verificación
        /// </summary>
        /// <param name="id">ID del cuidador</param>
        /// <returns>Mensaje de confirmación</returns>
        [HttpPost("{id}/verificar")]
        [Authorize(Roles = "Admin")] // Solo administradores pueden verificar
        public async Task<ActionResult> VerificarDocumento(int id)
        {
            var result = await _cuidadorService.VerificarDocumentoAsync(id);
            if (!result)
                return NotFound("Cuidador no encontrado");

            return Ok(new { message = "Documento verificado exitosamente" });
        }

        /// <summary>
        /// Actualiza la calificación promedio de un cuidador
        /// Este endpoint es generalmente llamado por el servicio de calificaciones
        /// </summary>
        [HttpPut("{id}/rating")]
        [Authorize] // Preferiblemente restringido a una API Key o rol de servicio en prod
        public async Task<ActionResult> UpdateRating(int id, [FromBody] RatingUpdateRequest request)
        {
            Console.WriteLine($"📥 Recibida actualización de rating para Cuidador {id}: {request.AverageRating}");
            
            var result = await _cuidadorService.UpdateRatingAsync(id, request.AverageRating);
            if (!result)
            {
                Console.WriteLine($"❌ No se encontró el cuidador {id} o no está activo");
                return NotFound("Cuidador no encontrado");
            }

            Console.WriteLine($"✅ Rating actualizado para Cuidador {id}");
            return Ok(new { message = "Calificación actualizada exitosamente" });
        }

        /// <summary>
        /// Endpoint de prueba para verificar que el controlador funciona
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult<object> Test()
        {
            return Ok(new { 
                message = "CuidadorController funcionando correctamente", 
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            });
        }

        /// <summary>
        /// Extrae el ID del usuario del token JWT actual
        /// Método auxiliar para obtener la identidad del usuario autenticado
        /// </summary>
        /// <returns>ID del usuario o null si no se puede extraer</returns>
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            return userId;
        }
    }
} 