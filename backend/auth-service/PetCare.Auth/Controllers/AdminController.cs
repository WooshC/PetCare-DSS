using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using System.Security.Claims;

namespace PetCareServicios.Controllers
{
    /// <summary>
    /// Controlador para operaciones administrativas de usuarios
    /// Todos los endpoints requieren rol Admin y validación de tenant (excepto bootstrap)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _servicioAdmin;

        public AdminController(AdminService servicioAdmin)
        {
            _servicioAdmin = servicioAdmin;
        }

        /// <summary>
        /// Bootstrap: Registra el PRIMER admin de un tenant
        /// IMPORTANTE: Este endpoint NO requiere autenticación pero SOLO funciona si no hay admins
        /// Úsalo una sola vez por tenant para crear el primer administrador
        /// </summary>
        [HttpPost("bootstrap")]
        [AllowAnonymous]
        public async Task<ActionResult<RespuestaOperacionAdmin>> BootstrapAdmin(
            [FromBody] BootstrapAdminRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAdmin.RegistrarPrimerAdminAsync(
                new AdminRegisterRequest
                {
                    Correo = solicitud.Correo,
                    Contraseña = solicitud.Contraseña,
                    Nombre = solicitud.Nombre,
                    Telefono = solicitud.Telefono
                },
                solicitud.IdentificadorArrendador);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Registra un nuevo Admin del sistema
        /// Endpoint protegido: Solo Admins autenticados pueden crear nuevos Admins
        /// El nuevo Admin pertenecerá al mismo tenant que el Admin autenticado
        /// </summary>
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> RegistrarAdmin(
            [FromBody] AdminRegisterRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.RegistrarAdminAsync(
                idAdminAutenticado,
                tenantAdmin,
                solicitud);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Registra un nuevo usuario en el sistema
        /// Solo Admins pueden crear otros usuarios (Cliente, Cuidador o Admin)
        /// </summary>
        [HttpPost("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> RegistrarUsuario(
            [FromBody] SolicitudRegistroAdmin solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.RegistrarUsuarioPorAdminAsync(
                idAdminAutenticado,
                tenantAdmin,
                solicitud);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Lista todos los usuarios del tenant del Admin autenticado
        /// </summary>
        [HttpGet("users")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> ListarUsuarios()
        {
            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para acceder a esta información"
                });
            }

            var resultado = await _servicioAdmin.ListarUsuariosDelTenantAsync(
                idAdminAutenticado,
                tenantAdmin);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Obtiene los detalles de un usuario específico
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> ObtenerDetallesUsuario(int id)
        {
            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para acceder a esta información"
                });
            }

            var resultado = await _servicioAdmin.ObtenerDetallesUsuarioAsync(
                idAdminAutenticado,
                tenantAdmin,
                id);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Cambia el rol de un usuario
        /// </summary>
        [HttpPut("users/{id}/role")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> CambiarRol(
            int id,
            [FromBody] SolicitudCambioRol solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validar que el ID en la URL coincide con el de la solicitud
            if (solicitud.IdUsuario != id)
            {
                return BadRequest(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El ID en la URL no coincide con el de la solicitud"
                });
            }

            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.CambiarRolAsync(
                idAdminAutenticado,
                tenantAdmin,
                solicitud);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Elimina un usuario del sistema
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> EliminarUsuario(int id)
        {
            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.EliminarUsuarioAsync(
                idAdminAutenticado,
                tenantAdmin,
                id);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Bloquea una cuenta de usuario
        /// </summary>
        [HttpPost("users/{id}/lock")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> BloquearUsuario(int id)
        {
            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.BloquearDesbloquearUsuarioAsync(
                idAdminAutenticado,
                tenantAdmin,
                id,
                bloquear: true);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Desbloquea una cuenta de usuario
        /// </summary>
        [HttpPost("users/{id}/unlock")]
        public async Task<ActionResult<RespuestaOperacionAdmin>> DesbloquearUsuario(int id)
        {
            // Obtener datos del usuario autenticado
            var idAdminAutenticado = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var tenantAdmin = User.FindFirst("tenant")?.Value;

            if (string.IsNullOrEmpty(idAdminAutenticado) || string.IsNullOrEmpty(tenantAdmin))
            {
                return Unauthorized(new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                });
            }

            var resultado = await _servicioAdmin.BloquearDesbloquearUsuarioAsync(
                idAdminAutenticado,
                tenantAdmin,
                id,
                bloquear: false);

            if (!resultado.Exitosa)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }
    }
}
