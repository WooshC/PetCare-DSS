using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Auth;
using PetCareServicios.Services;
using System.Security.Claims;
using PetCare.Auth.Models.Auth;

namespace PetCareServicios.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _servicioAutenticacion;
        private readonly UserManager<User> _gestorUsuarios;

        public AuthController(AuthService servicioAutenticacion, UserManager<User> gestorUsuarios)
        {
            _servicioAutenticacion = servicioAutenticacion;
            _gestorUsuarios = gestorUsuarios;
        }

        /// <summary>
        /// Registro de nuevos usuarios con soporte multi-tenancy
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAutenticacion.RegisterAsync(solicitud);
            
            if (!resultado.Success)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Inicio de sesión (obtener JWT con claims de tenant)
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAutenticacion.LoginAsync(solicitud);
            
            if (!resultado.Success)
            {
                return Unauthorized(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Solicitar reset de contraseña
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<ActionResult<PasswordResetResponse>> RequestPasswordReset([FromBody] PasswordResetRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAutenticacion.RequestPasswordResetAsync(solicitud);
            
            if (!resultado.Success)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Confirmar reset de contraseña
        /// </summary>
        [HttpPost("confirm-reset")]
        public async Task<ActionResult<PasswordResetResponse>> ConfirmPasswordReset([FromBody] PasswordResetConfirmRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAutenticacion.ConfirmPasswordResetAsync(solicitud);
            
            if (!resultado.Success)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Cambio directo de contraseña (para testing)
        /// </summary>
        [HttpPost("change-password")]
        public async Task<ActionResult<PasswordResetResponse>> ChangePassword([FromBody] DirectPasswordChangeRequest solicitud)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _servicioAutenticacion.ChangePasswordAsync(solicitud);
            
            if (!resultado.Success)
            {
                return BadRequest(resultado);
            }

            return Ok(resultado);
        }

        /// <summary>
        /// Obtener lista de usuarios del arrendador actual
        /// </summary>
        [HttpGet("users")]
        [Authorize] 
        public async Task<ActionResult<List<InformacionUsuario>>> GetUsers()
        {
            try
            {
                Console.WriteLine("🔍 Obteniendo lista de usuarios...");
                
                var usuarios = new List<InformacionUsuario>();
                var todosLosUsuarios = _gestorUsuarios.Users.ToList();
                
                Console.WriteLine($"📊 Total de usuarios encontrados: {todosLosUsuarios.Count}");
                
                foreach (var usuario in todosLosUsuarios)
                {
                    try
                    {
                        var roles = await _gestorUsuarios.GetRolesAsync(usuario);
                        usuarios.Add(new InformacionUsuario
                        {
                            Identificador = usuario.Id,
                            Correo = usuario.Email ?? string.Empty,
                            Nombre = usuario.Nombre ?? string.Empty,
                            Telefono = usuario.PhoneNumber ?? string.Empty,
                            IdentificadorArrendador = usuario.IdentificadorArrendador,
                            FechaCreacion = usuario.FechaCreacion,
                            Roles = roles.ToList(),
                            MFAHabilitado = usuario.MFAHabilitado
                        });
                        
                        Console.WriteLine($"✅ Usuario procesado: {usuario.Email} con roles: {string.Join(", ", roles)}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Error procesando usuario {usuario.Email}: {ex.Message}");
                    }
                }

                Console.WriteLine($"🎉 Lista de usuarios generada exitosamente: {usuarios.Count} usuarios");
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en GetUsers: {ex.Message}");
                return StatusCode(500, new { error = "Error interno del servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtener información de un usuario específico
        /// Permite acceso anónimo para llamadas internas entre servicios
        /// </summary>
        [HttpGet("users/{id}")]
        [AllowAnonymous] // Permitir acceso interno desde otros microservicios que no pasan token
        public async Task<ActionResult<UserInfoResponse>> GetUserById(int id)
        {
            try
            {
                var usuario = await _gestorUsuarios.FindByIdAsync(id.ToString());
                
                if (usuario == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                var roles = await _gestorUsuarios.GetRolesAsync(usuario);
                
                var informacion = new UserInfoResponse
                {
                    Id = usuario.Id,
                    Name = usuario.Nombre ?? string.Empty,
                    Email = usuario.Email ?? string.Empty,
                    PhoneNumber = usuario.PhoneNumber ?? string.Empty,
                    UserName = usuario.UserName ?? string.Empty,
                    CreatedAt = usuario.FechaCreacion,
                    Roles = roles.ToList()
                };

                return Ok(informacion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Endpoint de prueba para verificar que el controlador funciona
        /// </summary>
        [HttpGet("test")]
        [AllowAnonymous]
        public ActionResult<object> Test()
        {
            return Ok(new { 
                message = "AuthController funcionando correctamente", 
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            });
        }

        /// <summary>
        /// Obtener información del usuario actual (con tenant)
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<InformacionUsuario>> GetCurrentUser()
        {
            var idUsuario = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(idUsuario))
            {
                return Unauthorized();
            }

            var usuario = await _gestorUsuarios.FindByIdAsync(idUsuario);
            
            if (usuario == null)
            {
                return NotFound("Usuario no encontrado");
            }

            var roles = await _gestorUsuarios.GetRolesAsync(usuario);
            var informacion = new InformacionUsuario
            {
                Identificador = usuario.Id,
                Correo = usuario.Email ?? string.Empty,
                Nombre = usuario.Nombre ?? string.Empty,
                Telefono = usuario.PhoneNumber ?? string.Empty,
                IdentificadorArrendador = usuario.IdentificadorArrendador,
                FechaCreacion = usuario.FechaCreacion,
                Roles = roles.ToList(),
                MFAHabilitado = usuario.MFAHabilitado
            };

            return Ok(informacion);
        }
    }
} 