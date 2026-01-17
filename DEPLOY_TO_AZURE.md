# ☁️ Guía de Despliegue en Azure (Contenedores)

Esta guía te llevará paso a paso para desplegar **PetCare DSS** en Azure utilizando **Azure App Service for Containers** (con soporte Docker Compose).

---

## 📋 Prerrequisitos

1.  Tener una cuenta de **Azure** activa.
2.  Tener instalada la **Azure CLI** (`az`) en tu terminal.
    *   *Verificar con:* `az --version`
3.  Tener Docker corriendo localmente.

---

## 🚀 Paso 1: Crear Recursos en Azure

Abre tu terminal (PowerShell o Bash) y ejecuta los siguientes comandos:

### 1. Iniciar sesión
```bash
az login
```

### 2. Crear Grupo de Recursos
```bash
az group create --name PetCareResourceGroup --location eastus2
```

### 3. Crear Azure Container Registry (ACR)
Aquí almacenaremos tus imágenes Docker privadas.
*Reemplaza `petcareregistry123` con un nombre único.*
```bash
az acr create --resource-group PetCareResourceGroup --name petcareregistry123 --sku Basic --admin-enabled true
```

### 4. Iniciar sesión en el ACR
```bash
az acr login --name petcareregistry123
```

---

## 📦 Paso 2: Construir y Subir Imágenes

Debemos construir tus imágenes y subirlas al registro que acabamos de crear.

> **IMPORTANTE**: Reemplaza `petcareregistry123` con el nombre real de tu registro.

### Script de Construcción y Subida (PowerShell)

Ejecuta estos comandos uno por uno o crea un script `.ps1`:

```powershell
$ACR_NAME = "petcareregistry123"

# 1. Auth Service
docker build -t $ACR_NAME.azurecr.io/petcare-auth:latest -f backend/auth-service/PetCare.Auth/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-auth:latest

# 2. Cliente Service
docker build -t $ACR_NAME.azurecr.io/petcare-cliente:latest -f backend/cliente-service/PetCare.Cliente/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-cliente:latest

# 3. Cuidador Service
docker build -t $ACR_NAME.azurecr.io/petcare-cuidador:latest -f backend/cuidador-service/PetCare.Cuidador/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-cuidador:latest

# 4. Request Service
docker build -t $ACR_NAME.azurecr.io/petcare-request:latest -f backend/request-service/PetCare.Request/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-request:latest

# 5. Payment Service
docker build -t $ACR_NAME.azurecr.io/petcare-payment:latest -f backend/payment-service/PetCare.Payment/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-payment:latest

# 6. Rating Service
docker build -t $ACR_NAME.azurecr.io/petcare-calificar:latest -f backend/calificar-servicie/PetCare.Calificar/Dockerfile ./backend
docker push $ACR_NAME.azurecr.io/petcare-calificar:latest

# 7. Frontend
docker build -t $ACR_NAME.azurecr.io/petcare-frontend:latest -f PetCareSolution-frontend/Dockerfile ./PetCareSolution-frontend
docker push $ACR_NAME.azurecr.io/petcare-frontend:latest
```

---

## ☁️ Paso 3: Crear el App Service (Plan y Web App)

### 1. Crear el App Service Plan
Necesitamos un plan de Linux para correr contenedores.
```bash
az appservice plan create --name PetCarePlan --resource-group PetCareResourceGroup --sku B1 --is-linux
```

### 2. Crear la Web App Multi-Contenedor
```bash
az webapp create --resource-group PetCareResourceGroup --plan PetCarePlan --name petcare-dss-app --multicontainer-config-type compose --multicontainer-config-file docker-compose.azure.yml
```

### 3. Configurar Variables de Entorno en Azure
Es **CRÍTICO** configurar las variables que usamos en el `docker-compose.azure.yml` (`${ACR_NAME}`, `${DB_PASSWORD}`).

```bash
# Configurar la contraseña de BD segura y el nombre de registro
az webapp config appsettings set --resource-group PetCareResourceGroup --name petcare-dss-app --settings ACR_NAME=petcareregistry123 DB_PASSWORD=TuPasswordSuperSeguro123!
```

También necesitamos configurar las credenciales del registro para que Azure pueda descargar las imágenes:

```bash
# Obtener credenciales del ACR
$ACR_CREDENTIALS = az acr credential show --name petcareregistry123 --query "passwords[0].value" -o tsv
$ACR_USERNAME = "petcareregistry123"

# Configurar en la Web App
az webapp config container set --name petcare-dss-app --resource-group PetCareResourceGroup --docker-registry-server-url https://petcareregistry123.azurecr.io --docker-registry-server-user $ACR_USERNAME --docker-registry-server-password $ACR_CREDENTIALS
```

---

## 💾 Paso 4: Persistencia de Datos (Volúmenes)

Por defecto, App Service no persiste los datos de los contenedores si estos se reinician. Para las bases de datos SQL Server, necesitamos **Azure Storage**.

### 1. Crear Cuenta de Almacenamiento
```bash
az storage account create --resource-group PetCareResourceGroup --name petcarestorage123 --location eastus2 --sku Standard_LRS
```

### 2. Crear un File Share para cada BD
```bash
# Obtener connection string
$CONN_STR = az storage account show-connection-string --name petcarestorage123 --resource-group PetCareResourceGroup --query connectionString -o tsv

# Crear shares
az storage share create --name sqlvolume-auth --connection-string $CONN_STR
az storage share create --name sqlvolume-cliente --connection-string $CONN_STR
az storage share create --name sqlvolume-cuidador --connection-string $CONN_STR
# ... repetir para el resto
```

### 3. Montar los volúmenes en la Web App
Debes ir al Portal de Azure -> Tu Web App -> **Configuración** -> **Asignaciones de ruta de acceso** y montar estos File Shares en la ruta `/var/opt/mssql` de cada contenedor.

> **🚨 Recomendación Pro**: Para producción real, **NO uses contenedores para la base de datos**. Usa **Azure SQL Database**. Es más barato, seguro y tiene backups automáticos. Esta guía usa contenedores porque así lo solicitaste, pero ten cuidado con el rendimiento.

---

## ✅ Paso Final: Verificar

1.  Reinicia la Web App en el portal.
2.  Espera unos 5-10 minutos (el primer arranque es lento).
3.  Accede a `https://petcare-dss-app.azurewebsites.net`.

¡Tu plataforma de microservicios está en la nube! 🌍
