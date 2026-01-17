# 🐾 PetCare DSS - Plataforma de Cuidado de Mascotas

Bienvenido a la documentación técnica de **PetCare DSS**, una plataforma distribuida basada en microservicios diseñada para conectar a dueños de mascotas con cuidadores profesionales de manera segura y confiable.

## 🏗️ Arquitectura del Sistema

Esta sección describe la arquitectura de alto nivel utilizando el modelo C4.

### Nivel 1: Contexto del Sistema (C1)
Muestra el "Big Picture": cómo el sistema interactúa con sus usuarios y sistemas externos.

```mermaid
graph TD
    %% Actores
    Cliente[👤 Cliente/Dueño]
    Cuidador[👤 Cuidador Profesional]
    Admin[👤 Administrador]

    %% Sistema Principal
    subgraph "Enterprise Scope"
        PetCare[🐾 PetCare System]
    end

    %% Sistemas Externos
    PayPal[💳 PayPal API]

    %% Relaciones
    Cliente -->|Busca cuidados, reserva y paga| PetCare
    Cuidador -->|Gestiona perfil y acepta solicitudes| PetCare
    Admin -->|Gestiona usuarios y auditoría| PetCare

    PetCare -->|Procesa pagos| PayPal

    %% Estilos
    classDef person fill:#0d47a1,stroke:#000,stroke-width:2px,color:#fff
    classDef system fill:#1565c0,stroke:#000,stroke-width:2px,color:#fff
    classDef external fill:#7b1fa2,stroke:#000,stroke-width:2px,color:#fff

    class Cliente,Cuidador,Admin person
    class PetCare system
    class PayPal external
```

### Nivel 2: Diagrama de Contenedores (C2)
Muestra las aplicaciones desplegables (contenedores Docker) y cómo se comunican en este entorno de microservicios.

```mermaid
graph TD
    %% Frontend
    WebApp[💻 Web Application<br/>React + Vite]

    %% Microservicios
    subgraph "Backend Cluster (Docker)"
        Auth[🔐 Auth Service]
        Client[👤 Cliente Service]
        Caregiver[🩺 Cuidador Service]
        Request[📅 Request Service]
        Payment[💳 Payment Service]
        Rating[⭐ Rating Service]
    end

    %% Bases de Datos
    subgraph "Data Persistence (SQL Server)"
        DB_Auth[(Auth DB)]
        DB_Client[(Cliente DB)]
        DB_Caregiver[(Cuidador DB)]
        DB_Request[(Request DB)]
        DB_Payment[(Payment DB)]
        DB_Rating[(Rating DB)]
    end

    %% Relaciones UI -> Services
    WebApp -->|HTTPS/JSON| Auth
    WebApp -->|HTTPS/JSON| Client
    WebApp -->|HTTPS/JSON| Caregiver
    WebApp -->|HTTPS/JSON| Request
    WebApp -->|HTTPS/JSON| Payment
    WebApp -->|HTTPS/JSON| Rating

    %% Relaciones Internas
    Client -.->|Valida Token| Auth
    Caregiver -.->|Valida Token| Auth
    Request -.->|Valida| Client
    Request -.->|Valida| Caregiver
    Payment -.->|Actualiza Estado| Request

    %% Relaciones DB
    Auth --> DB_Auth
    Client --> DB_Client
    Caregiver --> DB_Caregiver
    Request --> DB_Request
    Payment --> DB_Payment
    Rating --> DB_Rating

    %% Estilos
    classDef web fill:#0288d1,stroke:#01579b,stroke-width:2px,color:#fff
    classDef service fill:#009688,stroke:#004d40,stroke-width:2px,color:#fff
    classDef db fill:#558b2f,stroke:#33691e,stroke-width:2px,color:#fff

    class WebApp web
    class Auth,Client,Caregiver,Request,Payment,Rating service
    class DB_Auth,DB_Client,DB_Caregiver,DB_Request,DB_Payment,DB_Rating db
```

## 📚 Documentación de Microservicios

Cada servicio tiene su propia documentación detallada con diagramas C3 (Componentes) y C4 (Código):

- 🔐 [Auth Service](./backend/auth-service/README.md)
- 👤 [Cliente Service](./backend/cliente-service/README.md)
- 🩺 [Cuidador Service](./backend/cuidador-service/README.md)
- 📅 [Request Service](./backend/request-service/README.md)
- 💳 [Payment Service](./backend/payment-service/README.md)
- ⭐ [Rating Service](./backend/calificar-servicie/README.md)
- 🧠 [Shared Kernel](./backend/shared-kernel/README.md)