# Servicio de Pagos (Payment Service)

Gestiona las transacciones financieras dentro de la plataforma, integrándose con pasarelas de pago externas (simulado vía PayPal Sandbox) y manteniendo un registro seguro y auditable de los pagos.

## Arquitectura C4

### Nivel 3: Diagrama de Componentes

```mermaid
graph TD
    %% Nodos externos
    User[Frontend]
    DB[(SQL Server: PaymentDB)]
    PayPal[PayPal API]
    
    subgraph "Payment Service Context"
        Controller[PaymentController]
        PayPalSvc[PayPalService]
        EncSvc[EncryptionService]
        Repo[PaymentDbContext]
        Audit[AuditService]
    end

    %% Relaciones
    User -->|Inicia Pago| Controller
    Controller -->|Procesa| PayPalSvc
    Controller -->|Encripta Datos| EncSvc
    
    PayPalSvc -->|REST API| PayPal
    PayPalSvc -->|Registra Transacción| Repo
    
    Controller -- Genera --> Audit
    Audit -- Persiste --> Repo
    Repo -->|SQL| DB

    %% Nota
    ServiceNote["Seguridad:<br/>- Encriptación AES-256 para datos sensibles<br/>- Integración con PayPal Sandbox"]
    EncSvc -.->|Provee| ServiceNote

    %% Estilos
    classDef component fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef note fill:#fffde7,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5,color:#333

    class PayPalSvc,EncSvc,Repo,Audit component
    class Controller api
    class DB db
    class PayPal external
    class ServiceNote note
```

### Nivel 4: Diagrama de Código

```mermaid
classDiagram
    %% Estilos
    classDef controller fill:#ffe0b2,stroke:#f57c00,stroke-width:1px
    classDef service fill:#bbdefb,stroke:#1976d2,stroke-width:1px
    classDef model fill:#c8e6c9,stroke:#388e3c,stroke-width:1px

    class PaymentController:::controller {
        +CreateOrder(PaymentRequest)
        +SaveCard(SaveCardRequest)
        +GetMyCards()
    }

    class PayPalService:::service {
        +CreateOrder(PaymentRequest)
        -GetAccessToken()
    }

    class EncryptionService:::service {
        +Encrypt(string text)
        +Decrypt(string cipher)
    }

    class CreditCardEntity:::model {
        +int Id
        +string UserId
        +string EncryptedCardNumber
        +string MaskedNumber
        +string CardHolderName
        +DateTime CreatedAt
    }

    PaymentController --> PayPalService
    PaymentController --> EncryptionService
    PaymentController ..> CreditCardEntity : Gestiona
```

## Funcionalidades
- **Creación de Pagos**: Genera enlaces de pago redireccionando a PayPal.
- **Ejecución de Pagos**: Finaliza la transacción una vez aprobada por el usuario.
- **Seguridad**: Los detalles sensibles se almacenan encriptados en la base de datos.
- **Auditoría**: Historial completo de transacciones.

## Tecnologías
- **Framework**: .NET 8
- **Base de Datos**: SQL Server
- **Pasarela**: PayPal SDK / REST API
- **Seguridad**: AES Encryption (System.Security.Cryptography)
