# 🚀 Guía Rápida para la Presentación de PetCare Solutions

Sigue estos pasos para levantar el proyecto y presentarlo sin problemas.

## 1. Preparación (Antes de empezar)
Asegúrate de tener **Docker Desktop** abierto y corriendo.

## 2. Iniciar el Proyecto
Abre una terminal en la carpeta del proyecto (`c:\Users\DETPC\Documents\GITHUB\PetCare-DSS`) y ejecuta:

```powershell
docker-compose down
docker-compose up -d --build
```

*Nota: Espera unos 30-60 segundos después de que termine el comando para que todos los microservicios y bases de datos inicien completamente.*

## 3. Exponer a Internet (Ngrok)
Abre **otra terminal** (o usa la que tienes si ya terminó el paso anterior) y ejecuta:

```powershell
C:\ngrook\ngrok.exe http --domain=abandonedly-ascomycetous-evita.ngrok-free.dev 8080
```

*Nota: Al usar `--domain`, te aseguras de mantener siempre el mismo link: `https://abandonedly-ascomycetous-evita.ngrok-free.dev`. Si quitas esa parte, te dará un link aleatorio distinto cada vez.*

## 4. Acceso y Demostración
Abre la URL de Ngrok en tu navegador (o `http://localhost:8080` si estás probando localmente).

### 🔑 Credenciales de Prueba

**Administrador (Acceso Total):**
- **Usuario:** `admin@petcare.ec`
- **Contraseña:** `PetCare#admin$2026`

**Cliente de Prueba:**
- **Usuario:** `cliente@test.com`
- **Contraseña:** `Cliente123!` (Si no existe, regístralo en vivo)

**Cuidador de Prueba:**
- **Usuario:** `cuidador@test.com`
- **Contraseña:** `Cuidador123!` (Si no existe, regístralo en vivo)

## 5. Troubleshooting (En caso de emergencia)

**Si algo falla o da error 404/500:**
1. Reinicia solo el Gateway (suele solucionar rutas):
   ```powershell
   docker-compose restart nginx-gateway
   ```
2. Reinicia todo si persiste:
   ```powershell
   docker-compose restart
   ```

**Verificar Logs en vivo:**
Si te preguntan por logs o necesitas ver qué pasa:
```powershell
docker logs -f petcare-dss-petcare-request-1
```
*(Cambia `request` por `auth`, `payment`, `cliente`, `cuidador` según el servicio)*

¡Éxito en la presentación! 🍀
