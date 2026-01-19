# Servicio de Solicitudes (Request Service)

El corazón operativo de la plataforma. Gestiona el ciclo de vida completo de una solicitud de cuidado, desde que el cliente la crea, el cuidador la acepta/rechaza, hasta que se marca como completada y pagada.

## Arquitectura C4

### Nivel 3: Diagrama de Componentes

```mermaid
graph TD
    %% Nodos externos
    User[Frontend/Gateway]
    DB[(SQL Server: RequestDB)]
    AuthSvc[Auth Service]
    CuidadorSvc[Cuidador Service]
    PaymentSvc[Payment Service]
    
    subgraph "Request Service Context"
        SolCtrl[SolicitudController]
        CliCtrl[SolicitudClienteController]
        CuiCtrl[SolicitudCuidadorController]
        Service[SolicitudService]
        Repo[RequestDbContext]
        Mapper[AutoMapper]
        Audit[AuditService]
    end

    %% Relaciones Entrantes
    User -->|CRUD Admin| SolCtrl
    User -->|Operaciones Cliente| CliCtrl
    User -->|Operaciones Cuidador| CuiCtrl

    %% Relaciones Internas
    SolCtrl --> Service
    CliCtrl --> Service
    CuiCtrl --> Service
    
    Service -->|Mapeo DTOs| Mapper
    Service -->|Persistencia| Repo
    Service -->|Auditoría| Audit
    
    %% Relaciones Salientes
    Service -->|Valida Usuario| AuthSvc
    Service -->|Valida/Consulta Tarifas| CuidadorSvc
    Service -->|Crea Orden Pago| PaymentSvc
    
    Repo -->|SQL| DB

    %% Nota
    ServiceNote["Estados de Solicitud:<br/>- Pendiente<br/>- Aceptada<br/>- En Progreso<br/>- Finalizada<br/>- Cancelada"]
    Service -.->|Gestiona| ServiceNote

    %% Estilos
    classDef component fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef note fill:#fffde7,stroke:#f57f17,stroke-width:1px,stroke-dasharray:5 5,color:#333

    class Service,Repo,Mapper,Audit component
    class SolCtrl,CliCtrl,CuiCtrl api
    class DB db
    class AuthSvc,CuidadorSvc,PaymentSvc external
    class ServiceNote note
```

### Nivel 4: Diagrama de Código

```mermaid
classDiagram
    %% Estilos
    classDef controller fill:#ffe0b2,stroke:#f57c00,stroke-width:1px
    classDef service fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    classDef model fill:#c8e6c9,stroke:#388e3c,stroke-width:1px

    class SolicitudController:::controller {
        +GetSolicitudes(filtros)
        +GetSolicitudById(id)
        +UpdateEstado(id, estado)
    }

    class SolicitudClienteController:::controller {
        +CreateSolicitud(request)
        +GetMisSolicitudes()
        +CancelarSolicitud(id)
        +PagarSolicitud(id)
        +CalificarSolicitud(id)
    }

    class SolicitudCuidadorController:::controller {
        +GetSolicitudesAsignadas()
        +AceptarSolicitud(id)
        +RechazarSolicitud(id)
        +IniciarServicio(id)
        +FinalizarServicio(id)
    }

    class SolicitudService:::service {
        +CreateSolicitudAsync()
        +UpdateSolicitudEstadoAsync()
        +EnrichSolicitudWithUserInfo()
        +CrearOrdenPagoAsync()
    }

    class Solicitud:::model {
        +int SolicitudID
        +int ClienteID
        +int? CuidadorID
        +string Estado
        +string ModoPago
        +bool IsPaid
        +bool IsRated
        +DateTime FechaHoraInicio
        +int DuracionHoras
    }

    SolicitudController --> SolicitudService
    SolicitudClienteController --> SolicitudService
    SolicitudCuidadorController --> SolicitudService
    SolicitudService --> Solicitud : Gestiona
```

## Funcionalidades
- **Gestión de Citas**: Creación, edición y cancelación de solicitudes de servicio.
- **Flujo de Estados**: Máquina de estados robusta para transiciones válidas (ej. no se puede pagar una solicitud rechazada).
- **Seguimiento de Pagos**: Registra si una solicitud ha sido pagada (conectando lógicamente con Payment Service).

## Tecnologías
- **Framework**: .NET 8
- **Base de Datos**: SQL Server
- **Mapeo**: AutoMapper
