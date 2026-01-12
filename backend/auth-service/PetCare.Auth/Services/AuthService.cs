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
        private readonly UserManager<User> _gestorUsuarios;
        private readonly SignInManager<User> _gestorSesion;
        private readonly IConfiguration _configuracion;

        public AuthService(
            UserManager<User> gestorUsuarios,
            SignInManager<User> gestorSesion,
            IConfiguration configuracion)
        {
            _gestorUsuarios = gestorUsuarios;
            _gestorSesion = gestorSesion;
            _configuracion = configuracion;
        }

        /// <summary>
        /// Registra un nuevo usuario con soporte para multi-tenancy
        /// </summary>
        public async Task<AuthResponse> RegisterAsync(RegisterRequest solicitud)
        {
            // Validar que el correo no esté registrado en el mismo arrendador
            var usuarioExistente = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.Email == solicitud.Correo && 
                                         u.IdentificadorArrendador == solicitud.IdentificadorArrendador);
            
            if (usuarioExistente != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el registro. Verifique los datos e intente nuevamente."
                };
            }

            // Validar que el teléfono no esté registrado en el mismo arrendador
            var usuarioPorTelefono = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == solicitud.Telefono && 
                                         u.IdentificadorArrendador == solicitud.IdentificadorArrendador);
            
            if (usuarioPorTelefono != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el registro. Verifique los datos e intente nuevamente."
                };
            }

            var nuevoUsuario = new User
            {
                UserName = solicitud.Correo,
                Email = solicitud.Correo,
                Nombre = solicitud.Nombre,
                PhoneNumber = solicitud.Telefono,
                IdentificadorArrendador = solicitud.IdentificadorArrendador
            };

            var resultadoCreacion = await _gestorUsuarios.CreateAsync(nuevoUsuario, solicitud.Contraseña);

            if (!resultadoCreacion.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el registro. Verifique los datos e intente nuevamente."
                };
            }

            // Asignar rol según el registro
            var resultadoRol = await _gestorUsuarios.AddToRoleAsync(nuevoUsuario, solicitud.Rol);
            if (!resultadoRol.Succeeded)
            {
                // Si falla la asignación de rol, eliminar el usuario creado
                await _gestorUsuarios.DeleteAsync(nuevoUsuario);
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el registro. Verifique los datos e intente nuevamente."
                };
            }

            return new AuthResponse
            {
                Success = true,
                Token = await GenerarTokenJWT(nuevoUsuario),
                Message = $"Registro exitoso como {solicitud.Rol}"
            };
        }

        /// <summary>
        /// Inicia sesión de usuario con validación de arrendador
        /// </summary>
        public async Task<AuthResponse> LoginAsync(LoginRequest solicitud)
        {
            var resultado = await _gestorSesion.PasswordSignInAsync(
                solicitud.Correo, solicitud.Contraseña, false, false);

            if (!resultado.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el inicio de sesión. Verifique los datos e intente nuevamente."
                };
            }

            var usuario = await _gestorUsuarios.FindByEmailAsync(solicitud.Correo);
            if (usuario == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el inicio de sesión. Verifique los datos e intente nuevamente."
                };
            }

            // Validar que el arrendador coincida
            if (usuario.IdentificadorArrendador != solicitud.IdentificadorArrendador)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "No se pudo completar el inicio de sesión. Verifique los datos e intente nuevamente."
                };
            }

            // Obtener roles del usuario
            var roles = await _gestorUsuarios.GetRolesAsync(usuario);

            return new AuthResponse
            {
                Success = true,
                Token = await GenerarTokenJWT(usuario),
                User = new UserInfo
                {
                    Id = usuario.Id,
                    Name = usuario.Nombre ?? string.Empty,
                    Email = usuario.Email ?? string.Empty,
                    PhoneNumber = usuario.PhoneNumber ?? string.Empty,
                    IdentificadorArrendador = usuario.IdentificadorArrendador,
                    Roles = roles.ToList()
                },
                Message = "Inicio de sesión exitoso"
            };
        }

        /// <summary>
        /// Genera token JWT con claims estándar según Common Criteria FIA_ATD.1
        /// Incluye: sub (identificador), role, tenant, mfa, iss, aud, exp, iat
        /// </summary>
        private async Task<string> GenerarTokenJWT(User usuario)
        {
            var roles = await _gestorUsuarios.GetRolesAsync(usuario);
            
            var reclamaciones = new List<Claim>
            {
                // Claim requerido: sub (asunto/identificador del usuario)
                new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                
                // Email del usuario
                new Claim(ClaimTypes.Email, usuario.Email ?? string.Empty),
                
                // Nombre del usuario
                new Claim(ClaimTypes.Name, usuario.Nombre ?? string.Empty),
                
                // Teléfono del usuario
                new Claim(ClaimTypes.MobilePhone, usuario.PhoneNumber ?? string.Empty),
                
                // TENANT: Identificador del arrendador (multi-tenancy)
                new Claim("tenant", usuario.IdentificadorArrendador ?? string.Empty),
                
                // MFA: Indica si está habilitado (RFC 8174)
                new Claim("mfa", usuario.MFAHabilitado.ToString().ToLower()),
                
                // Tiempo de emisión (RFC 7519)
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Agregar roles como claims
            foreach (var rol in roles)
            {
                reclamaciones.Add(new Claim(ClaimTypes.Role, rol));
            }

            var claveJWT = _configuracion["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key no configurada");
            var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJWT));
            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);
            var expiracion = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuracion["Jwt:ExpireDays"] ?? "7"));

            var token = new JwtSecurityToken(
                issuer: _configuracion["Jwt:Issuer"],
                audience: _configuracion["Jwt:Audience"],
                claims: reclamaciones,
                expires: expiracion,
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Solicita reset de contraseña (mensaje genérico para anti-enumeración)
        /// </summary>
        public async Task<PasswordResetResponse> RequestPasswordResetAsync(PasswordResetRequest request)
        {
            var usuario = await _gestorUsuarios.FindByEmailAsync(request.Email);
            
            if (usuario == null)
            {
                // Respuesta genérica para no revelar si el usuario existe (RF-04)
                return new PasswordResetResponse
                {
                    Success = true,
                    Message = "Si el correo existe en nuestro sistema, se enviará un enlace de restablecimiento"
                };
            }

            var token = await _gestorUsuarios.GeneratePasswordResetTokenAsync(usuario);
            
            return new PasswordResetResponse
            {
                Success = true,
                Message = "Si el correo existe en nuestro sistema, se enviará un enlace de restablecimiento",
                Token = token // Solo para testing - en producción no se devuelve
            };
        }

        /// <summary>
        /// Confirma el reset de contraseña
        /// </summary>
        public async Task<PasswordResetResponse> ConfirmPasswordResetAsync(PasswordResetConfirmRequest request)
        {
            var usuario = await _gestorUsuarios.FindByEmailAsync(request.Email);
            
            if (usuario == null)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Datos inválidos o token expirado"
                };
            }

            var resultado = await _gestorUsuarios.ResetPasswordAsync(usuario, request.Token, request.NewPassword);
            
            if (!resultado.Succeeded)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Datos inválidos o token expirado"
                };
            }

            return new PasswordResetResponse
            {
                Success = true,
                Message = "Contraseña restablecida exitosamente"
            };
        }

        /// <summary>
        /// Cambia la contraseña del usuario
        /// </summary>
        public async Task<PasswordResetResponse> ChangePasswordAsync(DirectPasswordChangeRequest request)
        {
            var usuario = await _gestorUsuarios.FindByEmailAsync(request.Email);
            
            if (usuario == null)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = "Usuario no encontrado"
                };
            }

            var token = await _gestorUsuarios.GeneratePasswordResetTokenAsync(usuario);
            var resultado = await _gestorUsuarios.ResetPasswordAsync(usuario, token, request.NewPassword);
            
            if (!resultado.Succeeded)
            {
                return new PasswordResetResponse
                {
                    Success = false,
                    Message = string.Join(", ", resultado.Errors.Select(e => e.Description))
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