# 🚀 Guía de Instalación y Despliegue - PetCare DSS

Esta guía detalla los pasos para poner en marcha la **Plataforma PetCare** en tu entorno local, ya sea utilizando Docker (recomendado) o configurando los servicios manualmente.

---

## 📋 Prerrequisitos

Asegúrate de tener instaladas las siguientes herramientas:

1.  **Docker Desktop**: Para ejecutar contenedores y orquestar servicios. [Descargar](https://www.docker.com/products/docker-desktop/)
2.  **Git**: Para clonar el repositorio.
3.  **.NET 8 SDK**: Solo si planeas ejecutar/depurar el backend sin Docker.
4.  **Node.js (v18+)**: Solo si planeas ejecutar el frontend localmente sin Docker.
5.  **SQL Server**: Si ejecutas localmente sin Docker, necesitarás una instancia de SQL Server.

---

## 🐳 Opción A: Despliegue Rápido con Docker (Recomendado)

Esta es la forma más fácil de iniciar todo el sistema (Frontend + Backend + Bases de Datos) con un solo comando.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/PetCare-DSS.git
cd PetCare-DSS
```

### 2. Construir y Levantar contenedores
```bash
docker-compose up -d --build
```
> **Nota**: La primera vez puede tardar unos minutos en descargar las imágenes base y compilar los proyectos.

### 3. Verificar instalación
Una vez finalizado, accede a la aplicación web:
👉 **http://localhost:5173**

---

## 🔌 Puertos y Servicios

A continuación se detallan los puertos expuestos por cada microservicio y base de datos en la configuración de Docker.

| Servicio | Contenedor (Docker) | Puerto Local | Base de Datos (SQL Server) |
| :--- | :--- | :--- | :--- |
| **Frontend** | `petcare-frontend` | **5173** | N/A |
| **Auth Service** | `petcare-auth` | **5043** | 14331 |
| **Cliente Service** | `petcare-cliente` | **5045** | 14332 |
| **Cuidador Service** | `petcare-cuidador` | **5044** | 14333 |
| **Request Service** | `petcare-request` | **5050** | 14334 |
| **Payment Service** | `petcare-payment` | **5012** | 14335 |
| **Rating Service** | `petcare-calificar` | **5075** | 14336 |

> **Credenciales BD**: El password por defecto para todas las instancias SQL Server es `YourStrong@Passw0rd` (según `docker-compose.yml`).

---

## 🛠️ Opción B: Ejecución Local (Desarrollo)

Si deseas ejecutar los servicios "en caliente" para desarrollo:

### 1. Configurar Base de Datos
Debes tener SQL Server corriendo localmente y actualizar las cadenas de conexión en el archivo `appsettings.json` de cada microservicio para apuntar a tu instancia local (no a los contenedores).

### 2. Ejecutar Backend
Navega a la carpeta de cada servicio y ejecuta:
```bash
cd backend/auth-service/PetCare.Auth
dotnet run
# El servicio se iniciará en los puertos definidos en su launchSettings.json (usualmente 5xxx y 7xxx)
```
*Repite esto para cada microservicio en terminales separadas.*

### 3. Ejecutar Frontend
```bash
cd PetCareSolution-frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 🛑 Solución de Problemas Comunes

1.  **Conflictos de Puerto**: Si un puerto (ej. 14331) está ocupado, modifica el `docker-compose.yml` en la sección `ports` (ej. `"14341:1433"`).
2.  **Errores de Conexión BD**: Asegúrate de que los contenedores de base de datos (`db-auth`, `db-cliente`, etc.) estén en estado `Healthy` o `Running` antes de que los servicios intenten conectar. Docker Compose gestiona esto con `depends_on`, pero a veces SQL Server tarda unos segundos más en aceptar conexiones.
3.  **CORS**: Si ejecutas el frontend localmente contra backend en Docker, verifica que los orígenes estén permitidos en las políticas de CORS del backend.
