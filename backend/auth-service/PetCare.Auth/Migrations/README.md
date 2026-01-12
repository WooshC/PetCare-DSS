# Migraciones de PetCare.Auth 🔄

Este directorio contiene las migraciones de Entity Framework Core para el servicio de autenticación.

## Migraciones Existentes

- **20250719012536_InitialCreate** - Migración inicial que crea las tablas de Identity
- **UpdateRoles** - Actualización de roles para incluir "Cuidador" en lugar de "Veterinario"

## Comandos Útiles

### Crear una nueva migración
```bash
dotnet ef migrations add NombreDeLaMigracion
```

### Aplicar migraciones pendientes
```bash
dotnet ef database update
```

### Revertir la última migración
```bash
dotnet ef migrations remove
```

### Generar script SQL
```bash
dotnet ef migrations script
```

### Ver migraciones aplicadas
```bash
dotnet ef migrations list
```

## Aplicación Automática

Las migraciones se aplican automáticamente al iniciar la aplicación en modo desarrollo.

## Estructura de la Base de Datos

Las migraciones crean las siguientes tablas:

- **AspNetUsers** - Usuarios del sistema
- **AspNetRoles** - Roles de usuario
- **AspNetUserRoles** - Relación usuarios-roles
- **AspNetUserClaims** - Claims de usuarios
- **AspNetRoleClaims** - Claims de roles
- **AspNetUserLogins** - Logins externos
- **AspNetUserTokens** - Tokens de usuario
- **__EFMigrationsHistory** - Historial de migraciones

## Notas Importantes

- Las migraciones se aplican automáticamente en desarrollo
- En producción, usar `dotnet ef database update` manualmente
- Siempre revisar las migraciones antes de aplicarlas
- Hacer backup de la base de datos antes de aplicar migraciones en producción 