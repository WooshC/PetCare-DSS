-- ============================================
-- SCRIPT DE SEGURIDAD - PRIVILEGIOS MÍNIMOS BD
-- ============================================
-- EJECUTAR COMO: SA o Admin
-- PROPÓSITO: Crear usuario de aplicación con privilegios mínimos
-- ============================================

-- 1. Crear Login para la aplicación (si no existe)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'petcare_app')
BEGIN
    CREATE LOGIN [petcare_app] WITH PASSWORD = 'SecurePass123!';
    PRINT '✓ Login [petcare_app] creado'
END
ELSE
BEGIN
    PRINT '⚠ Login [petcare_app] ya existe'
END

-- 2. Crear usuario de BD en PetCareAuth
USE [PetCareAuth];
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'petcare_app')
BEGIN
    CREATE USER [petcare_app] FOR LOGIN [petcare_app];
    PRINT '✓ Usuario [petcare_app] creado en PetCareAuth'
END
ELSE
BEGIN
    PRINT '⚠ Usuario [petcare_app] ya existe en PetCareAuth'
END

-- 3. Otorgar SOLO los permisos MÍNIMOS necesarios
-- Permisos sobre tablas de Identity
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [petcare_app];

-- Permisos específicos para procedimientos almacenados (si existen)
-- GRANT EXECUTE ON SCHEMA::dbo TO [petcare_app];

-- 4. NEGAR permisos peligrosos
DENY ALTER ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY CREATE TABLE ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY CREATE PROCEDURE ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY CREATE FUNCTION ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY CREATE TRIGGER ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY DROP ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY CONTROL ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY ALTER ANY SCHEMA ON DATABASE::[PetCareAuth] TO [petcare_app];
DENY ALTER ANY LOGIN ON DATABASE::[PetCareAuth] TO [petcare_app];

PRINT '✓ Permisos peligrosos NEGADOS'

-- 5. Verificar permisos asignados
PRINT '======================================'
PRINT 'PERMISOS DEL USUARIO petcare_app:'
PRINT '======================================'

SELECT 
    PERMISSION_NAME = perm.permission_name,
    OBJECT_NAME = obj.name,
    ESTADO = CASE 
        WHEN perm.state = 'G' THEN 'GRANT'
        WHEN perm.state = 'D' THEN 'DENY'
        ELSE 'REVOKE'
    END
FROM sys.database_permissions perm
INNER JOIN sys.objects obj ON perm.major_id = obj.object_id
WHERE perm.grantee_principal_id = (SELECT principal_id FROM sys.database_principals WHERE name = 'petcare_app')
ORDER BY obj.name, perm.permission_name;

PRINT '======================================'
PRINT '✓ Script de seguridad completado'
PRINT '======================================'

-- 6. Información de conexión para appsettings.json
PRINT ''
PRINT 'ConnectionString para appsettings.json:'
PRINT 'Server=localhost,1433;Database=PetCareAuth;User Id=petcare_app;Password=SecurePass123!;TrustServerCertificate=true;'
PRINT ''
