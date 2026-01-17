# ⭐ Servicio de Calificaciones (Rating Service)

Este microservicio gestiona las valoraciones y reseñas que los dueños de mascotas dejan a los cuidadores. Es fundamental para el sistema de confianza y reputación de la plataforma.

## 🏗️ Arquitectura C4

### Nivel 3: Diagrama de Componentes

```mermaid
graph TD
    %% Nodos externos
    User[Frontend / Mobile]
    DB[(SQL Server: RatingDB)]

    subgraph "Rating Service Context"
        Controller[RatingsController]
        Repo[AppDbContext / EF Core]
    end

    %% Relaciones
    User -->|HTTP POST / GET| Controller
    Controller -->|Persistencia| Repo
    Repo -->|SQL| DB

    %% Nota como nodo
    ServiceNote["📝 Responsabilidades:<br/>- Crear calificaciones (1-5 estrellas)<br/>- Añadir comentarios<br/>- Consultar historial"]
    Controller -.->|Implementa| ServiceNote

    %% Estilos
    classDef component fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef note fill:#fffde7,stroke:#f57f17,stroke-width:1px,stroke-dasharray: 5 5,color:#333

    class Controller,Repo component
    class DB db
    class ServiceNote note
```

### Nivel 4: Diagrama de Código

```mermaid
classDiagram
    %% Estilos
    classDef controller fill:#ffe0b2,stroke:#f57c00,stroke-width:1px
    classDef model fill:#c8e6c9,stroke:#388e3c,stroke-width:1px
    classDef db fill:#bbdefb,stroke:#1976d2,stroke-width:1px

    class RatingsController:::controller {
        +GetRatings(Guid cuidadorId)
        +CreateRating(Rating rating)
    }

    class Ratings:::model {
        +int Id
        +Guid ClienteId
        +Guid CuidadorId
        +int Score
        +string Comentario
        +DateTime Fecha
    }

    class AppDbContext:::db {
        +DbSet~Ratings~ Ratings
    }

    RatingsController --> AppDbContext : Usa
    AppDbContext --> Ratings : Persiste
```

## 🚀 Funcionalidades
- **Calificar**: Permite a un cliente calificar a un cuidador con un puntaje y comentario.
- **Historial**: Permite recuperar todas las calificaciones asociadas a un cuidador específico.

## 🛠️ Tecnologías
- **Framework**: .NET 8
- **Base de Datos**: SQL Server
- **ORM**: Entity Framework Core
