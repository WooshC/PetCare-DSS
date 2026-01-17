# 🔐 Servicio de Autenticación (Auth Service)

Es el guardián de la seguridad en PetCare. Gestiona el registro, inicio de sesión (JWT) y la administración de usuarios y roles. También expone endpoints para que otros servicios validen identidades y obtengan información de usuarios.

## 🏗️ Arquitectura C4

### Nivel 3: Diagrama de Componentes

```mermaid
graph TD
    %% Nodos externos
    User[Frontend]
    DB[(SQL Server: AuthDB)]
    
    subgraph "Auth Service Context"
        AuthController[AuthController]
        AdminController[AdminController]
        AuthService[AuthService]
        AdminService[UsuarioService]
        Repo[AuthDbContext]
    end

    %% Relaciones
    User -->|Login / Register| AuthController
    User -->|Admin Dashboard| AdminController
    
    AuthController -->|Valida credenciales| AuthService
    AdminController -->|Gestiona Cuentas| AdminService
    
    AuthService --> Repo
    AdminService --> Repo
    Repo -->|SQL| DB

    %% Nota como nodo
    ServiceNote["📝 Funciones Clave:<br/>- Emisión de JWT<br/>- Roles (Cliente, Cuidador, Admin)<br/>- Bloqueo/Desbloqueo de cuentas"]
    AuthService -.->|Core| ServiceNote

    %% Estilos
    classDef component fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef note fill:#fffde7,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5,color:#333

    class AuthController,AdminController api
    class AuthService,AdminService,Repo component
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
        +Login(LoginDto)
        +Register(RegisterDto)
    }

    class AdminController:::controller {
        +GetUsers()
        +LockUser(id)
        +UnlockUser(id)
    }

    class AuthService:::service {
        +AuthenticateAsync()
        +GenerateJwtToken()
    }
    
    class Usuario:::model {
        +String Id
        +String UserName
        +Boolean CuentaBloqueada
        +String PasswordHash
    }

    AuthController --> AuthService
    AdminController --> AuthService
    AuthService ..> Usuario
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
