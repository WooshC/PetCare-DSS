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
        private readonly AuthService _authService;
        private readonly UserManager<User> _userManager;

        public AuthController(AuthService authService, UserManager<User> userManager)
        {
            _authService = authService;
            _userManager = userManager;
        }

        /// <summary>
        /// Registro de nuevos usuarios
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Inicio de sesión (obtener JWT)
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request);
            
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Solicitar reset de contraseña
        /// </summary>
        [HttpPost("reset-password")]
        public async Task<ActionResult<PasswordResetResponse>> RequestPasswordReset([FromBody] PasswordResetRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RequestPasswordResetAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Confirmar reset de contraseña
        /// </summary>
        [HttpPost("confirm-reset")]
        public async Task<ActionResult<PasswordResetResponse>> ConfirmPasswordReset([FromBody] PasswordResetConfirmRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ConfirmPasswordResetAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Cambio directo de contraseña (para testing)
        /// </summary>
        [HttpPost("change-password")]
        public async Task<ActionResult<PasswordResetResponse>> ChangePassword([FromBody] DirectPasswordChangeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.ChangePasswordAsync(request);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Obtener lista de usuarios
        /// </summary>
        [HttpGet("users")]
        [Authorize] 
        public async Task<ActionResult<List<UserInfo>>> GetUsers()
        {
            try
            {
                Console.WriteLine("🔍 Obteniendo lista de usuarios...");
                
                var users = new List<UserInfo>();
                var allUsers = _userManager.Users.ToList();
                
                Console.WriteLine($"📊 Total de usuarios encontrados: {allUsers.Count}");
                
                foreach (var user in allUsers)
                {
                    try
                    {
                        var roles = await _userManager.GetRolesAsync(user);
                        users.Add(new UserInfo
                        {
                            Id = user.Id,
                            Email = user.Email ?? string.Empty,
                            Name = user.Name ?? string.Empty,
                            CreatedAt = user.CreatedAt,
                            Roles = roles.ToList()
                        });
                        
                        Console.WriteLine($"✅ Usuario procesado: {user.Email} con roles: {string.Join(", ", roles)}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"⚠️ Error procesando usuario {user.Email}: {ex.Message}");
                    }
                }

                Console.WriteLine($"🎉 Lista de usuarios generada exitosamente: {users.Count} usuarios");
                return Ok(users);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error en GetUsers: {ex.Message}");
                return StatusCode(500, new { error = "Error interno del servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtener información de un usuario específico
        /// </summary>
        [HttpGet("users/{id}")]
        [Authorize]
        public async Task<ActionResult<UserInfoResponse>> GetUserById(int id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                var roles = await _userManager.GetRolesAsync(user);
                
                var userInfo = new UserInfoResponse
                {
                    Id = user.Id,
                    Name = user.Name ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    CreatedAt = user.CreatedAt,
                    Roles = roles.ToList()
                };

                return Ok(userInfo);
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
        /// Obtener información del usuario actual
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserInfo>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            
            if (user == null)
            {
                return NotFound("Usuario no encontrado");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var userInfo = new UserInfo
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                Name = user.Name ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                CreatedAt = user.CreatedAt,
                Roles = roles.ToList()
            };

            return Ok(userInfo);
        }
    }
} 