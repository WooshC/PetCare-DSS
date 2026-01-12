# Implementación de Tenant (Multi-Tenancy) en Auth Service
## Resumen de Cambios - 11 de Enero 2026

---

## 📋 Requisitos Implementados

### RF-05: Atributos de Sesión en JWT (Tenant)
**Estado**: ✅ **IMPLEMENTADO COMPLETAMENTE**

#### Cambios realizados:

##### 1️⃣ **Modelo User.cs**
- ✅ Agregado campo `IdentificadorArrendador` (string, Max 100 caracteres)
- ✅ Renombrado `Name` → `Nombre` (para consistencia en español)
- ✅ Renombrado `CreatedAt` → `FechaCreacion` (para consistencia en español)
- ✅ Agregado campo `MFAHabilitado` (bool) - preparación para HU-03
- ✅ Agregado campo `ClaveSecretaMFA` (string, nullable) - preparación para HU-03
- ✅ Agregado campo `IntentosLoginFallidos` (int) - preparación para RF-02
- ✅ Agregado campo `FechaUltimoIntentoFallido` (DateTime, nullable) - preparación para RF-02
- ✅ Agregado campo `CuentaBloqueada` (bool) - preparación para RF-02
- ✅ Agregado campo `FechaBloqueo` (DateTime, nullable) - preparación para RF-02

##### 2️⃣ **Modelos de Solicitudes**

**RegisterRequest.cs (SolicitudRegistro)**
```csharp
public class SolicitudRegistro
{
    public string Correo { get; set; }                    // Email del usuario
    public string Contraseña { get; set; }                // Con validación: min 8 chars, mayús, minús, números
    public string Nombre { get; set; }                    // Nombre completo
    public string Telefono { get; set; }                  // Número de contacto
    public string IdentificadorArrendador { get; set; }   // TENANT - Identificador único del arrendador
    public string Rol { get; set; }                       // Cliente, Cuidador, Admin
}
```

**LoginRequest.cs (SolicitudLogin)**
```csharp
public class SolicitudLogin
{
    public string Correo { get; set; }
    public string Contraseña { get; set; }
    public string IdentificadorArrendador { get; set; }   // TENANT requerido en login
}
```

**UserInfo.cs (InformacionUsuario)**
- ✅ Renombrado a `InformacionUsuario` para consistencia
- ✅ Agregado campo `IdentificadorArrendador`
- ✅ Agregado campo `MFAHabilitado`
- ✅ Renombrados campos a español (Identificador, Correo, Nombre, etc.)
- ✅ Mantenida compatibilidad con propiedades antiguas mediante alias

##### 3️⃣ **AuthService.cs (ServicioAutenticacion)**

**Métodos actualizados:**
- `RegisterAsync()` 
  - ✅ Validación de correo único por **tenant** (no global)
  - ✅ Validación de teléfono único por **tenant** (no global)
  - ✅ Asignación de `IdentificadorArrendador` al crear usuario
  - ✅ Mensajes genéricos para anti-enumeración (RF-04)

- `LoginAsync()`
  - ✅ Validación de que el usuario pertenece al **tenant** indicado
  - ✅ Devuelve información del usuario con `IdentificadorArrendador`
  - ✅ Mensajes genéricos para anti-enumeración (RF-04)

- `GenerarTokenJWT()` 
  - ✅ Incluye claim `tenant` con el `IdentificadorArrendador`
  - ✅ Incluye claim `sub` (RFC 7519) con el ID del usuario
  - ✅ Incluye claim `mfa` indicando si está habilitado
  - ✅ Incluye claim `iat` (issued at) en Unix timestamp
  - ✅ Estructura JWT según Common Criteria FIA_ATD.1

**JWT Token Actual:**
```json
{
  "sub": "1",                           // ID del usuario
  "email": "user@example.com",
  "name": "Juan Pérez",
  "phone": "+34600123456",
  "tenant": "acme-corp",                // NUEVO: Identificador del arrendador
  "mfa": "false",                       // NUEVO: Estado MFA del usuario
  "role": "Cliente",
  "iss": "PetCare.Auth",
  "aud": "PetCare.Client",
  "iat": 1705001234,                    // NUEVO: Timestamp de emisión
  "exp": 1705605234
}
```

##### 4️⃣ **AuthController.cs**
- ✅ Renombradas variables a español (`_servicioAutenticacion`, `_gestorUsuarios`)
- ✅ Actualizados parámetros de métodos a `SolicitudRegistro`, `SolicitudLogin`
- ✅ Actualizado endpoint `GET /api/auth/me` para devolver `InformacionUsuario` con tenant
- ✅ Actualizado endpoint `GET /api/auth/users` para devolver lista con tenants
- ✅ Actualizado endpoint `GET /api/auth/users/{id}` con datos de tenant

##### 5️⃣ **Migración de Base de Datos**
- ✅ Creada migración `20260111_AgregarTenantYMFA.cs`
- ✅ Índice en columna `IdentificadorArrendador` para búsquedas rápidas
- ✅ Índice compuesto único en `(Email, IdentificadorArrendador)` para validación multi-tenant
- ✅ Todas las columnas nuevas con valores por defecto apropiados
- ✅ Actualizado `AuthDbContextModelSnapshot.cs`

---

## 📊 Arquitectura Multi-Tenancy

### Segregación de Datos por Tenant

```
┌─────────────────────────────────────────┐
│      Arrendador A (acme-corp)          │
│  ┌─────────────────────────────────┐   │
│  │ Usuario: juan@acme.com          │   │
│  │ Tenant: acme-corp               │   │
│  │ Email único: juan@acme.com      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Usuario: maria@acme.com         │   │
│  │ Tenant: acme-corp               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      Arrendador B (petcare-clinic)      │
│  ┌─────────────────────────────────┐   │
│  │ Usuario: juan@clinic.com        │   │
│  │ Tenant: petcare-clinic          │   │
│  │ Email único: juan@clinic.com    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘

⚠️ Nota: juan@acme.com y juan@clinic.com son usuarios diferentes
          porque pertenecen a diferentes tenants
```

### Validación de Acceso

- ✅ En **Register**: Verifica que correo + tenant sean únicos
- ✅ En **Login**: Valida que el usuario pertenece al tenant indicado
- ✅ En **GetCurrentUser**: Devuelve información incluyendo tenant del usuario
- ✅ En **GetUsers**: Podría filtrar por tenant del usuario actual (pendiente implementar)

---

## 🔐 Cumplimiento de Requisitos de Seguridad

### RF-05: Atributos de Sesión en JWT ✅
| Atributo | Implementado | Descripción |
|----------|--------------|-------------|
| `sub` | ✅ | Subject - ID del usuario (RFC 7519) |
| `role` | ✅ | Rol del usuario (Cliente, Cuidador, Admin) |
| `tenant` | ✅ | Identificador del arrendador |
| `mfa` | ✅ | Indicador si MFA está habilitado |
| `iss` | ✅ | Issuer - PetCare.Auth |
| `aud` | ✅ | Audience - PetCare.Client |
| `exp` | ✅ | Tiempo de expiración |
| `iat` | ✅ | Tiempo de emisión |

### RF-04: Mensajes Genéricos (Anti-enumeración) ✅
- ✅ Register: Mensaje genérico si usuario o teléfono ya existen
- ✅ Login: Mensaje genérico si credenciales son inválidas
- ✅ RequestPasswordReset: Respuesta positiva aunque usuario no exista
- ✅ ConfirmPasswordReset: Mensaje genérico "Datos inválidos o token expirado"

### RF-03: Política de Contraseñas Fuertes ✅
```csharp
// En Program.cs
options.Password.RequireDigit = true;           // Números requeridos
options.Password.RequiredLength = 8;            // Mínimo 8 caracteres
options.Password.RequireNonAlphanumeric = false;// No require caracteres especiales
options.Password.RequireUppercase = true;      // Mayúsculas requeridas

// Validación adicional en SolicitudRegistro
[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$")]
```

---

## 📚 Ejemplo de Uso

### 1. Registro de nuevo usuario
```json
POST /api/auth/register
{
  "correo": "juan@acme.com",
  "contraseña": "MiPassword123",
  "nombre": "Juan Pérez García",
  "telefono": "+34600123456",
  "identificadorArrendador": "acme-corp",
  "rol": "Cliente"
}

Response 200 OK:
{
  "success": true,
  "token": "eyJhbGc...",
  "message": "Registro exitoso como Cliente"
}
```

### 2. Login
```json
POST /api/auth/login
{
  "correo": "juan@acme.com",
  "contraseña": "MiPassword123",
  "identificadorArrendador": "acme-corp"
}

Response 200 OK:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "identificador": 1,
    "correo": "juan@acme.com",
    "nombre": "Juan Pérez García",
    "telefono": "+34600123456",
    "identificadorArrendador": "acme-corp",
    "fechaCreacion": "2026-01-11T10:30:00Z",
    "roles": ["Cliente"],
    "mfaHabilitado": false
  },
  "message": "Inicio de sesión exitoso"
}
```

### 3. Obtener usuario actual
```
GET /api/auth/me
Authorization: Bearer eyJhbGc...

Response 200 OK:
{
  "identificador": 1,
  "correo": "juan@acme.com",
  "nombre": "Juan Pérez García",
  "telefono": "+34600123456",
  "identificadorArrendador": "acme-corp",
  "fechaCreacion": "2026-01-11T10:30:00Z",
  "roles": ["Cliente"],
  "mfaHabilitado": false
}
```

---

## 📈 Próximos Pasos

### 1️⃣ **RF-02: Bloqueo de Cuenta tras Intentos Fallidos**
- Implementar lógica de conteo de intentos fallidos
- Bloquear cuenta después de N intentos (ej. 5)
- Resetear conteo después de tiempo (ej. 30 min)
- Enviar notificación al usuario

### 2️⃣ **HU-03: MFA para Admins**
- Generar secret TOTP con librería como `Otp.NET` o `Google.Authenticator`
- Crear endpoint para setup MFA: `POST /api/auth/mfa/setup`
- Crear endpoint para verificar TOTP: `POST /api/auth/mfa/verify`
- Requerir MFA para roles Admin en operaciones críticas

### 3️⃣ **RF-06: JWT de Servicio para Inter-microservicios**
- Crear endpoint especial: `POST /api/auth/service-token`
- Generar tokens sin expiración para servicios (o con expiración larga)
- Validación de credenciales de servicio (cliente_id + cliente_secret)

### 4️⃣ **RNF-01: TLS 1.2+ Obligatorio**
- Configurar Kestrel para requerir HTTPS
- Deshabilitar protocolo TLS < 1.2
- Configurar certificados SSL en producción

### 5️⃣ **RNF-02: Cifrado TDE + Azure Key Vault**
- Implementar Azure Key Vault para secrets
- Configurar TDE en SQL Server
- Cambiar appsettings.json a usar Key Vault

---

## 📝 Notas Técnicas

### Base de Datos
```sql
-- Índices creados
CREATE INDEX IX_AspNetUsers_IdentificadorArrendador 
  ON AspNetUsers(IdentificadorArrendador);

CREATE UNIQUE INDEX IX_AspNetUsers_Email_IdentificadorArrendador 
  ON AspNetUsers(Email, IdentificadorArrendador);
```

### Compatibilidad hacia atrás
- Se mantienen clases alias `RegisterRequest` y `LoginRequest` 
- Se mantienen propiedades alias `UserInfo` con getters/setters
- El código legacy seguirá funcionando

### Variables en Español
- Todas las nuevas variables y parámetros usan nombres en español
- Métodos: `GenerarTokenJWT()`, `RegisterAsync()`, `LoginAsync()`
- Propiedades: `Correo`, `Contraseña`, `Nombre`, `Telefono`
- Servicios: `_servicioAutenticacion`, `_gestorUsuarios`

---

## ✅ Checklist de Validación

- [x] Migración de BD creada
- [x] Modelo User actualizado
- [x] Solicitud de Registro con tenant
- [x] Solicitud de Login con tenant
- [x] Token JWT con claim 'tenant'
- [x] Anti-enumeración implementada (RF-04)
- [x] Validación de contraseña fuerte (RF-03)
- [x] Información de usuario incluye tenant
- [x] Índices de base de datos para tenant
- [x] Variables en español
- [x] Documentación de cambios
- [ ] Tests unitarios (pendiente)
- [ ] Tests de integración (pendiente)
- [ ] Despliegue en desarrollo (pendiente)

---

**Fecha**: 11 de Enero 2026  
**Autor**: GitHub Copilot  
**Versión**: 1.0 - Implementación Multi-Tenancy Completa
