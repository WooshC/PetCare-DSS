using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PetCareServicios.Models.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PetCareServicios.Services
{
    public class AuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _config;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest model)
        {
            var existingUserByPhone = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == model.PhoneNumber);
            
            if (existingUserByPhone != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "El número de teléfono ya está registrado."
                };
            }

            var user = new User
            {
                UserName = model.Email,
                Email = model.Email,
                Name = model.Name,
                PhoneNumber = model.PhoneNumber // ✅ ASIGNAR EL PHONE NUMBER
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            // Asignar rol según el registro
            var roleResult = await _userManager.AddToRoleAsync(user, model.Role);
            if (!roleResult.Succeeded)
            {
                // Si falla la asignación de rol, eliminar el usuario creado
                await _userManager.DeleteAsync(user);
                return new AuthResponse
                {
                    Success = false,
                    Message = $"Error al asignar rol: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}"
                };
            }

            return new AuthResponse
            {
                Success = true,
                Token = await GenerateJwtToken(user),
                Message = $"Registro exitoso como {model.Role}"
            };
        }

       public async Task<AuthResponse> LoginAsync(LoginRequest model)
        {
            var result = await _signInManager.PasswordSignInAsync(
                model.Email, model.Password, false, false);

            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Credenciales inválidas"
                };
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "Usuario no encontrado"
                };
            }

            // Obtener roles del usuario
            var roles = await _userManager.GetRolesAsync(user);

            return new AuthResponse
            {
                Success = true,
                Token = await GenerateJwtToken(user),
                User = new UserInfo
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles.ToList()
                },
                Message = "Inicio de sesión exitoso"
            };
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Name, user.Name ?? string.Empty),
                new Claim(ClaimTypes.MobilePhone, user.PhoneNumber ?? string.Empty) // ✅ AGREGAR PHONE AL TOKEN
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key no configurada");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_config["Jwt:ExpireDays"]));

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ... resto de los métodos se mantienen igual
        public async Task<PasswordResetResponse> RequestPasswordResetAsync(PasswordResetRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Si el email existe, se enviará un enlace de restablecimiento"
                };
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            return new PasswordResetResponse
            {
                Success = true,
                Message = "Se ha enviado un enlace de restablecimiento a su email",
                Token = token // Solo para testing - en producción no se devuelve
            };
        }

        public async Task<PasswordResetResponse> ConfirmPasswordResetAsync(PasswordResetConfirmRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Usuario no encontrado"
                };
            }

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            
            if (!result.Succeeded)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new PasswordResetResponse
            {
                Success = true,
                Message = "Contraseña restablecida exitosamente"
            };
        }

        public async Task<PasswordResetResponse> ChangePasswordAsync(DirectPasswordChangeRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Usuario no encontrado"
                };
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            
            if (!result.Succeeded)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new PasswordResetResponse
            {
                Success = true,
                Message = "Contraseña cambiada exitosamente"
            };
        }
    }
}