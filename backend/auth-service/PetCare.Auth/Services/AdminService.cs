using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PetCareServicios.Models.Auth;

namespace PetCareServicios.Services
{
    /// <summary>
    /// Servicio de administración de usuarios para roles Admin
    /// Incluye validaciones de tenant y permisos
    /// </summary>
    public class AdminService
    {
        private readonly UserManager<User> _gestorUsuarios;
        private readonly RoleManager<UserRole> _gestorRoles;
        private readonly IConfiguration _configuracion;

        public AdminService(
            UserManager<User> gestorUsuarios,
            RoleManager<UserRole> gestorRoles,
            IConfiguration configuracion)
        {
            _gestorUsuarios = gestorUsuarios;
            _gestorRoles = gestorRoles;
            _configuracion = configuracion;
        }

        /// <summary>
        /// Registra un nuevo usuario por parte de un Admin
        /// Valida que el Admin pertenece al mismo tenant y que solo Admins pueden crear Admins
        /// </summary>
        public async Task<RespuestaOperacionAdmin> RegistrarUsuarioPorAdminAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            SolicitudRegistroAdmin solicitud)
        {
            // 1. Validar que el usuario autenticado existe y es Admin
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                };
            }

            // 2. Validar que el Admin pertenece al mismo tenant
            if (usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para registrar usuarios en este arrendador"
                };
            }

            // 3. Validar que solo Admins pueden crear otros Admins
            if (solicitud.Rol == "Admin")
            {
                var rolesAdmin = await _gestorUsuarios.GetRolesAsync(usuarioAdmin);
                if (!rolesAdmin.Contains("Admin"))
                {
                    return new RespuestaOperacionAdmin
                    {
                        Exitosa = false,
                        Mensaje = "Solo Admins pueden crear otros Admins"
                    };
                }
            }

            // 4. Validar que el correo no esté registrado en el mismo tenant
            var usuarioExistente = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.Email == solicitud.Correo &&
                                         u.IdentificadorArrendador == tenantAdmin);

            if (usuarioExistente != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El correo electrónico ya está registrado en este arrendador"
                };
            }

            // 5. Validar que el teléfono no esté registrado en el mismo tenant
            var usuarioPorTelefono = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == solicitud.Telefono &&
                                         u.IdentificadorArrendador == tenantAdmin);

            if (usuarioPorTelefono != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El teléfono ya está registrado en este arrendador"
                };
            }

            // 6. Crear el nuevo usuario
            var nuevoUsuario = new User
            {
                UserName = solicitud.Correo,
                Email = solicitud.Correo,
                Nombre = solicitud.Nombre,
                PhoneNumber = solicitud.Telefono,
                IdentificadorArrendador = tenantAdmin
            };

            var resultadoCreacion = await _gestorUsuarios.CreateAsync(nuevoUsuario, solicitud.Contraseña);
            if (!resultadoCreacion.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al crear el usuario. Verifique los datos e intente nuevamente"
                };
            }

            // 7. Asignar rol
            var resultadoRol = await _gestorUsuarios.AddToRoleAsync(nuevoUsuario, solicitud.Rol);
            if (!resultadoRol.Succeeded)
            {
                // Si falla la asignación de rol, eliminar el usuario
                await _gestorUsuarios.DeleteAsync(nuevoUsuario);
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al asignar el rol. Usuario no creado"
                };
            }

            // 8. Retornar información del usuario creado
            var roles = await _gestorUsuarios.GetRolesAsync(nuevoUsuario);
            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = $"Usuario {solicitud.Rol} creado exitosamente",
                Datos = new
                {
                    nuevoUsuario.Id,
                    nuevoUsuario.Email,
                    nuevoUsuario.Nombre,
                    nuevoUsuario.PhoneNumber,
                    nuevoUsuario.IdentificadorArrendador,
                    Roles = roles.ToList()
                }
            };
        }

        /// <summary>
        /// Lista todos los usuarios del tenant del Admin autenticado
        /// </summary>
        public async Task<RespuestaOperacionAdmin> ListarUsuariosDelTenantAsync(
            string idAdminAutenticado,
            string tenantAdmin)
        {
            // Validar que el usuario autenticado pertenece al mismo tenant
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null || usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para acceder a esta información"
                };
            }

            // Obtener todos los usuarios del tenant
            var usuariosTenant = await _gestorUsuarios.Users
                .Where(u => u.IdentificadorArrendador == tenantAdmin)
                .ToListAsync();

            var usuariosInfo = new List<object>();
            foreach (var usuario in usuariosTenant)
            {
                var roles = await _gestorUsuarios.GetRolesAsync(usuario);
                usuariosInfo.Add(new
                {
                    usuario.Id,
                    usuario.Email,
                    usuario.Nombre,
                    usuario.PhoneNumber,
                    usuario.FechaCreacion,
                    usuario.CuentaBloqueada,
                    usuario.MFAHabilitado,
                    Roles = roles.ToList()
                });
            }

            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = $"Se encontraron {usuariosInfo.Count} usuarios",
                Datos = usuariosInfo
            };
        }

        /// <summary>
        /// Obtiene los detalles de un usuario específico del tenant
        /// </summary>
        public async Task<RespuestaOperacionAdmin> ObtenerDetallesUsuarioAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            int idUsuario)
        {
            // Validar que el usuario autenticado pertenece al mismo tenant
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null || usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para acceder a esta información"
                };
            }

            // Obtener el usuario
            var usuario = await _gestorUsuarios.FindByIdAsync(idUsuario.ToString());
            if (usuario == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            // Validar que el usuario pertenece al mismo tenant
            if (usuario.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para acceder a esta información"
                };
            }

            // Obtener roles del usuario
            var roles = await _gestorUsuarios.GetRolesAsync(usuario);

            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = "Usuario encontrado",
                Datos = new
                {
                    usuario.Id,
                    usuario.Email,
                    usuario.Nombre,
                    usuario.PhoneNumber,
                    usuario.FechaCreacion,
                    usuario.CuentaBloqueada,
                    usuario.MFAHabilitado,
                    usuario.IntentosLoginFallidos,
                    usuario.FechaUltimoIntentoFallido,
                    usuario.FechaBloqueo,
                    Roles = roles.ToList()
                }
            };
        }

        /// <summary>
        /// Cambia el rol de un usuario
        /// Solo Admins pueden cambiar roles, y no pueden cambiar rol a otros Admins
        /// </summary>
        public async Task<RespuestaOperacionAdmin> CambiarRolAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            SolicitudCambioRol solicitud)
        {
            // 1. Validar que el usuario autenticado es Admin y pertenece al mismo tenant
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null || usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                };
            }

            // 2. Obtener el usuario a cambiar
            var usuarioParaCambiar = await _gestorUsuarios.FindByIdAsync(solicitud.IdUsuario.ToString());
            if (usuarioParaCambiar == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            // 3. Validar que el usuario pertenece al mismo tenant
            if (usuarioParaCambiar.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para cambiar el rol de este usuario"
                };
            }

            // 4. Validar que no se intenta cambiar rol a otro Admin (por seguridad)
            var rolesActuales = await _gestorUsuarios.GetRolesAsync(usuarioParaCambiar);
            if (rolesActuales.Contains("Admin") && solicitud.NuevoRol != "Admin")
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No se puede cambiar el rol de un Admin a través de este endpoint. Requiere acceso especial"
                };
            }

            // 5. Remover roles actuales
            var resultadoRemover = await _gestorUsuarios.RemoveFromRolesAsync(usuarioParaCambiar, rolesActuales.ToArray());
            if (!resultadoRemover.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al cambiar el rol. Intente nuevamente"
                };
            }

            // 6. Agregar nuevo rol
            var resultadoAgregar = await _gestorUsuarios.AddToRoleAsync(usuarioParaCambiar, solicitud.NuevoRol);
            if (!resultadoAgregar.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al asignar el nuevo rol. Intente nuevamente"
                };
            }

            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = $"Rol cambiado a {solicitud.NuevoRol} exitosamente",
                Datos = new
                {
                    usuarioParaCambiar.Id,
                    usuarioParaCambiar.Email,
                    NuevoRol = solicitud.NuevoRol
                }
            };
        }

        /// <summary>
        /// Elimina un usuario del sistema
        /// Solo Admins pueden eliminar usuarios de su tenant
        /// </summary>
        public async Task<RespuestaOperacionAdmin> EliminarUsuarioAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            int idUsuarioAEliminar)
        {
            // 1. Validar que el usuario autenticado pertenece al mismo tenant
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null || usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                };
            }

            // 2. Obtener el usuario a eliminar
            var usuarioAEliminar = await _gestorUsuarios.FindByIdAsync(idUsuarioAEliminar.ToString());
            if (usuarioAEliminar == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            // 3. Validar que el usuario pertenece al mismo tenant
            if (usuarioAEliminar.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para eliminar este usuario"
                };
            }

            // 4. No permitir que se elimine a sí mismo
            if (usuarioAdmin.Id == usuarioAEliminar.Id)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No puedes eliminar tu propia cuenta"
                };
            }

            // 5. Eliminar el usuario
            var resultado = await _gestorUsuarios.DeleteAsync(usuarioAEliminar);
            if (!resultado.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al eliminar el usuario"
                };
            }

            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = $"Usuario {usuarioAEliminar.Email} eliminado exitosamente"
            };
        }

        /// <summary>
        /// Bloquea o desbloquea una cuenta de usuario
        /// </summary>
        public async Task<RespuestaOperacionAdmin> BloquearDesbloquearUsuarioAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            int idUsuario,
            bool bloquear)
        {
            // 1. Validar que el usuario autenticado pertenece al mismo tenant
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null || usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                };
            }

            // 2. Obtener el usuario
            var usuario = await _gestorUsuarios.FindByIdAsync(idUsuario.ToString());
            if (usuario == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            // 3. Validar que el usuario pertenece al mismo tenant
            if (usuario.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para modificar este usuario"
                };
            }

            // 4. Actualizar estado de bloqueo
            usuario.CuentaBloqueada = bloquear;
            if (bloquear)
            {
                usuario.FechaBloqueo = DateTime.UtcNow;
            }
            else
            {
                usuario.FechaBloqueo = null;
                usuario.IntentosLoginFallidos = 0; // Resetear intentos fallidos
            }

            var resultado = await _gestorUsuarios.UpdateAsync(usuario);
            if (!resultado.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al actualizar el estado de la cuenta"
                };
            }

            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = bloquear ? "Usuario bloqueado exitosamente" : "Usuario desbloqueado exitosamente",
                Datos = new
                {
                    usuario.Id,
                    usuario.Email,
                    usuario.CuentaBloqueada,
                    usuario.FechaBloqueo
                }
            };
        }

        /// <summary>
        /// Registra un nuevo Admin del sistema
        /// Solo Admins autenticados y pertenecientes al mismo tenant pueden crear nuevos Admins
        /// Método protegido por [Authorize(Roles = "Admin")] en el controlador
        /// </summary>
        public async Task<RespuestaOperacionAdmin> RegistrarAdminAsync(
            string idAdminAutenticado,
            string tenantAdmin,
            AdminRegisterRequest solicitud)
        {
            // 1. Validar que el usuario autenticado existe
            var usuarioAdmin = await _gestorUsuarios.FindByIdAsync(idAdminAutenticado);
            if (usuarioAdmin == null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para realizar esta operación"
                };
            }

            // 2. Validar que el Admin autenticado pertenece al mismo tenant
            if (usuarioAdmin.IdentificadorArrendador != tenantAdmin)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado para registrar Admins en otro arrendador"
                };
            }

            // 3. Validar que el Admin autenticado tiene el rol Admin
            var rolesAdmin = await _gestorUsuarios.GetRolesAsync(usuarioAdmin);
            if (!rolesAdmin.Contains("Admin"))
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "No autorizado. Solo Admins pueden crear otros Admins"
                };
            }

            // 4. Validar que el correo no esté registrado en el mismo tenant
            var usuarioExistente = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.Email == solicitud.Correo &&
                                         u.IdentificadorArrendador == tenantAdmin);

            if (usuarioExistente != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El correo electrónico ya está registrado en este arrendador"
                };
            }

            // 5. Validar que el teléfono no esté registrado en el mismo tenant
            var usuarioPorTelefono = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == solicitud.Telefono &&
                                         u.IdentificadorArrendador == tenantAdmin);

            if (usuarioPorTelefono != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El teléfono ya está registrado en este arrendador"
                };
            }

            // 6. Crear el nuevo Admin
            var nuevoAdmin = new User
            {
                UserName = solicitud.Correo,
                Email = solicitud.Correo,
                Nombre = solicitud.Nombre,
                PhoneNumber = solicitud.Telefono,
                IdentificadorArrendador = tenantAdmin
            };

            var resultadoCreacion = await _gestorUsuarios.CreateAsync(nuevoAdmin, solicitud.Contraseña);
            if (!resultadoCreacion.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al crear el Admin. Verifique los datos e intente nuevamente",
                    Datos = resultadoCreacion.Errors.Select(e => e.Description).ToList()
                };
            }

            // 7. Asignar rol Admin
            var resultadoRol = await _gestorUsuarios.AddToRoleAsync(nuevoAdmin, "Admin");
            if (!resultadoRol.Succeeded)
            {
                // Si falla la asignación de rol, eliminar el usuario creado
                await _gestorUsuarios.DeleteAsync(nuevoAdmin);
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al asignar el rol Admin. Usuario no creado"
                };
            }

            // 8. Retornar información del Admin creado
            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = "Admin creado exitosamente",
                Datos = new
                {
                    nuevoAdmin.Id,
                    nuevoAdmin.Email,
                    nuevoAdmin.Nombre,
                    nuevoAdmin.PhoneNumber,
                    nuevoAdmin.IdentificadorArrendador,
                    Rol = "Admin"
                }
            };
        }

        /// <summary>
        /// Registra el PRIMER admin del sistema (bootstrap)
        /// Solo funciona si NO hay ningún admin registrado
        /// Este método es para inicialización del sistema únicamente
        /// </summary>
        public async Task<RespuestaOperacionAdmin> RegistrarPrimerAdminAsync(
            AdminRegisterRequest solicitud,
            string identificadorArrendador)
        {
            // 1. Verificar que NO existen admins en el sistema (bootstrap check)
            var adminExistente = await _gestorUsuarios.Users
                .Where(u => u.IdentificadorArrendador == identificadorArrendador)
                .ToListAsync();

            var hayAdminsEnTenant = false;
            foreach (var usuario in adminExistente)
            {
                var roles = await _gestorUsuarios.GetRolesAsync(usuario);
                if (roles.Contains("Admin"))
                {
                    hayAdminsEnTenant = true;
                    break;
                }
            }

            if (hayAdminsEnTenant)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Ya existe un admin en este tenant. Use /api/admin/register para crear más admins."
                };
            }

            // 2. Validar que el correo no esté registrado en el tenant
            var usuarioExistente = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.Email == solicitud.Correo &&
                                         u.IdentificadorArrendador == identificadorArrendador);

            if (usuarioExistente != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El correo electrónico ya está registrado en este tenant"
                };
            }

            // 3. Validar que el teléfono no esté registrado en el tenant
            var usuarioPorTelefono = await _gestorUsuarios.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == solicitud.Telefono &&
                                         u.IdentificadorArrendador == identificadorArrendador);

            if (usuarioPorTelefono != null)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "El teléfono ya está registrado en este tenant"
                };
            }

            // 4. Crear el primer Admin
            var nuevoAdmin = new User
            {
                UserName = solicitud.Correo,
                Email = solicitud.Correo,
                Nombre = solicitud.Nombre,
                PhoneNumber = solicitud.Telefono,
                IdentificadorArrendador = identificadorArrendador
            };

            var resultadoCreacion = await _gestorUsuarios.CreateAsync(nuevoAdmin, solicitud.Contraseña);
            if (!resultadoCreacion.Succeeded)
            {
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al crear el primer admin",
                    Datos = resultadoCreacion.Errors.Select(e => e.Description).ToList()
                };
            }

            // 5. Asignar rol Admin
            var resultadoRol = await _gestorUsuarios.AddToRoleAsync(nuevoAdmin, "Admin");
            if (!resultadoRol.Succeeded)
            {
                await _gestorUsuarios.DeleteAsync(nuevoAdmin);
                return new RespuestaOperacionAdmin
                {
                    Exitosa = false,
                    Mensaje = "Error al asignar el rol Admin"
                };
            }

            // 6. Retornar información del Admin creado
            return new RespuestaOperacionAdmin
            {
                Exitosa = true,
                Mensaje = $"✅ Primer Admin del tenant '{identificadorArrendador}' creado exitosamente. Ahora puedes usar /api/admin/register para crear más admins.",
                Datos = new
                {
                    nuevoAdmin.Id,
                    nuevoAdmin.Email,
                    nuevoAdmin.Nombre,
                    nuevoAdmin.PhoneNumber,
                    nuevoAdmin.IdentificadorArrendador,
                    Rol = "Admin"
                }
            };
        }
    }
}
