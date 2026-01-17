# Admin Dashboard - Cambios Realizados

## Problema
El dashboard del admin no mostraba la información correcta de Clientes y Cuidadores. Los campos `NombreUsuario`, `EmailUsuario` y `TelefonoUsuario` estaban vacíos porque no se estaban obteniendo desde el servicio de autenticación.

## Solución Implementada

### 1. Backend - Cliente Service

#### Archivo: `backend/cliente-service/PetCare.Cliente/Services/ClienteService.cs`

**Cambios realizados:**
- ✅ Agregado `HttpClient` como dependencia inyectada
- ✅ Agregado configuración para `AuthServiceUrl`
- ✅ Modificado el método `GetAllAsync()` para enriquecer las respuestas con datos del usuario
- ✅ Agregado método privado `EnriquecerConDatosDelUsuarioAsync()` que:
  - Llama al endpoint `/api/auth/users/{id}` del servicio de autenticación
  - Obtiene los datos del usuario (nombre, email, teléfono)
  - Enriquece el objeto `ClienteResponse` con esta información
- ✅ Agregado clase DTO `UserInfoDto` para deserializar la respuesta del auth service

**Código agregado:**
```csharp
private async Task EnriquecerConDatosDelUsuarioAsync(ClienteResponse clienteResponse)
{
    try
    {
        var url = $"{_authServiceUrl}/users/{clienteResponse.UsuarioID}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        var response = await _httpClient.SendAsync(request);

        if (response.IsSuccessStatusCode)
        {
            var userInfo = await response.Content.ReadFromJsonAsync<UserInfoDto>();
            if (userInfo != null)
            {
                clienteResponse.NombreUsuario = userInfo.Name ?? string.Empty;
                clienteResponse.EmailUsuario = userInfo.Email ?? string.Empty;
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error al obtener datos del usuario: {ex.Message}");
    }
}
```

#### Archivo: `backend/cliente-service/PetCare.Cliente/appsettings.json`

**Cambios realizados:**
- ✅ Agregada sección `Services` con la URL del servicio de autenticación

```json
"Services": {
  "AuthServiceUrl": "http://localhost:5043/api/auth"
}
```

#### Archivo: `backend/cliente-service/PetCare.Cliente/appsettings.Docker.json`

**Cambios realizados:**
- ✅ Agregada sección `Services` con la URL del servicio de autenticación para Docker

```json
"Services": {
  "AuthServiceUrl": "http://auth-service:8080/api/auth"
}
```

### 2. Frontend - Admin API

#### Archivo: `PetCareSolution-frontend/src/services/api/adminAPI.js`

**Cambios realizados:**
- ✅ Corregidos los nombres de las variables de entorno:
  - `VITE_CLIENTE_API_URL` → `VITE_CLIENT_API_URL`
  - `VITE_CUIDADOR_API_URL` → `VITE_CAREGIVER_API_URL`
- ✅ Corregido el endpoint para obtener cuidadores:
  - `/all` → `/` (para coincidir con el CuidadorController)

**Antes:**
```javascript
const clienteApi = axios.create({
    baseURL: import.meta.env.VITE_CLIENTE_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

const cuidadorApi = axios.create({
    baseURL: import.meta.env.VITE_CUIDADOR_API_URL,
    headers: { 'Content-Type': 'application/json' },
});
```

**Después:**
```javascript
const clienteApi = axios.create({
    baseURL: import.meta.env.VITE_CLIENT_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

const cuidadorApi = axios.create({
    baseURL: import.meta.env.VITE_CAREGIVER_API_URL,
    headers: { 'Content-Type': 'application/json' },
});
```

## Cómo Funciona Ahora

### Flujo de Datos

1. **Admin Dashboard** (Frontend) solicita la lista de clientes/cuidadores
2. **Cliente/Cuidador Service** obtiene los datos de la base de datos
3. **Cliente/Cuidador Service** llama al **Auth Service** para obtener información del usuario
4. **Auth Service** devuelve: `{ Id, Name, Email, PhoneNumber, UserName }`
5. **Cliente/Cuidador Service** enriquece el response con estos datos
6. **Admin Dashboard** recibe y muestra:
   - ID
   - Usuario (nombre + documento de identidad)
   - Contacto (email + teléfono)
   - Estado (verificado/pendiente)
   - Acciones (botón validar)

### Tabla del Admin Dashboard

| ID | Usuario | Contacto | Estado | Acciones |
|----|---------|----------|--------|----------|
| #1 | Juan Pérez<br>CI: 12345678 | juan@email.com<br>📞 555-1234 | ✅ Verificado | - |
| #2 | María García<br>CI: 87654321 | maria@email.com<br>📞 555-5678 | ⚠️ Pendiente | [Validar] |

## Servicios Involucrados

### Auth Service
- **Endpoint**: `GET /api/auth/users/{id}`
- **Autorización**: `[AllowAnonymous]` (para llamadas internas entre microservicios)
- **Respuesta**:
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phoneNumber": "555-1234",
  "userName": "juan@email.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "roles": ["Cliente"]
}
```

### Cliente Service
- **Endpoint**: `GET /api/cliente`
- **Autorización**: `[Authorize(Roles = "Admin")]`
- **Respuesta enriquecida**:
```json
[
  {
    "clienteID": 1,
    "usuarioID": 1,
    "documentoIdentidad": "12345678",
    "telefonoEmergencia": "555-1234",
    "documentoVerificado": true,
    "fechaVerificacion": "2024-01-15T00:00:00Z",
    "nombreUsuario": "Juan Pérez",
    "emailUsuario": "juan@email.com",
    "estado": "Activo"
  }
]
```

### Cuidador Service
- **Endpoint**: `GET /api/cuidador`
- **Autorización**: `[Authorize]`
- **Respuesta enriquecida**: Similar a Cliente, con campos adicionales de cuidador

## Notas Importantes

1. **El CuidadorService ya tenía esta funcionalidad implementada** - solo se necesitó implementarla en ClienteService
2. **HttpClient ya estaba registrado** en el Program.cs del cliente-service
3. **El Auth Service permite acceso anónimo** al endpoint `/api/auth/users/{id}` para facilitar las llamadas entre microservicios
4. **Manejo de errores**: Si el auth-service no responde, los campos de usuario quedan vacíos pero no rompe la aplicación

## Próximos Pasos

Para probar los cambios:

1. **Reiniciar el Cliente Service** para que cargue la nueva configuración
2. **Verificar que el Auth Service esté corriendo** en `http://localhost:5043`
3. **Acceder al Admin Dashboard** y verificar que se muestren los datos correctamente
4. **Verificar los logs** en la consola del Cliente Service para ver las llamadas al Auth Service

## Comandos para Probar

```bash
# Navegar al cliente-service
cd backend/cliente-service/PetCare.Cliente

# Ejecutar el servicio
dotnet run

# En otra terminal, navegar al frontend
cd PetCareSolution-frontend

# Ejecutar el frontend
npm run dev
```
