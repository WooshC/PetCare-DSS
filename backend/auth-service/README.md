# 🔐 Servicio de Autenticación (Auth Service)

Es el guardián de la seguridad en PetCare. Gestiona el registro, inicio de sesión (JWT) y la administración de usuarios y roles. También expone endpoints para que otros servicios validen identidades y obtengan información de usuarios.

## 🏗️ Arquitectura C4

### Nivel 3: Diagrama de Componentes

```mermaid
graph TD
    %% Nodos externos
    User[Frontend/Gateway]
    DB[(SQL Server: AuthDB)]
    
    subgraph "Auth Service Context"
        AuthController[AuthController]
        AdminController[AdminController]
        AuthService[AuthService]
        AdminService[AdminService]
        UserManager[UserManager Identity]
        Repo[AuthDbContext]
    end

    %% Relaciones
    User -->|Login/Register/Me| AuthController
    User -->|Admin Ops| AdminController
    
    AuthController -->|Lógica Auth| AuthService
    AuthController -->|Consultas| UserManager
    
    AdminController -->|Gestión| AdminService
    
    AuthService --> UserManager
    AdminService --> UserManager
    
    UserManager --> Repo
    Repo -->|SQL| DB

    %% Nota como nodo
    ServiceNote["📝 Funciones Clave:<br/>- Identity Management<br/>- JWT Token Generation<br/>- Roles & Claims (Tenant)<br/>- Multi-tenancy Support"]
    AuthService -.->|Core| ServiceNote

    %% Estilos
    classDef component fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef note fill:#fffde7,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5,color:#333

    class AuthController,AdminController api
    class AuthService,AdminService,UserManager,Repo component
    class DB db
    class ServiceNote note
```

### Nivel 4: Diagrama de Código

```mermaid
classDiagram
    %% Estilos
    classDef controller fill:#ffe0b2,stroke:#f57c00,stroke-width:1px
    classDef service fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    classDef model fill:#c8e6c9,stroke:#388e3c,stroke-width:1px

    class AuthController:::controller {
        +Register(RegisterRequest)
        +Login(LoginRequest)
        +RequestPasswordReset(request)
        +ConfirmPasswordReset(request)
        +ChangePassword(request)
        +GetUsers()
        +GetUserById(id)
        +GetCurrentUser()
    }

    class AdminController:::controller {
        +RegistrarAdmin(request)
        +RegistrarUsuario(request)
        +ListarUsuarios()
        +ObtenerDetallesUsuario(id)
        +CambiarRol(id, request)
        +EliminarUsuario(id)
        +BloquearUsuario(id)
        +DesbloquearUsuario(id)
    }

    class AuthService:::service {
        +RegisterAsync()
        +LoginAsync()
        +RequestPasswordResetAsync()
        +ConfirmPasswordResetAsync()
        +ChangePasswordAsync()
    }
    
    class AdminService:::service {
        +RegistrarAdminAsync()
        +RegistrarUsuarioPorAdminAsync()
        +BloquearDesbloquearUsuarioAsync()
    }

    class User:::model {
        +String Id
        +String Nombre
        +String IdentificadorArrendador
        +Boolean CuentaBloqueada
    }

    AuthController --> AuthService
    AuthController --> User : Usa UserManager
    AdminController --> AdminService
    AuthService ..> User
    AdminService ..> User
```

## 🚀 Funcionalidades
- **Autenticación JWT**: Generación y validación de tokens seguros.
- **Gestión de Roles**: Soporte para roles de Administrador, Cliente y Cuidador.
- **Administración**: Endpoints para ver lista de usuarios y gestionar bloqueos de acceso.
- **Integración entre Servicios**: Provee datos de usuario (email, teléfono, bloqueo) a `Cliente-Service` y `Cuidador-Service`.

## 🛠️ Tecnologías
- **Framework**: .NET 8 (ASP.NET Core Identity)
- **Base de Datos**: SQL Server
- **Seguridad**: JWT Bearer Authentication
