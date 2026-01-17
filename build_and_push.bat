@echo off
set "PATH=%PATH%;C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin"
set /p ACR_NAME="Ingresa el nombre de tu Azure Container Registry (ej: petcareregistry123): "

echo --------------------------------------------------
echo 1. Iniciando sesion en ACR: %ACR_NAME%...
echo --------------------------------------------------
call az acr login --name %ACR_NAME%
if %ERRORLEVEL% NEQ 0 (
    echo Error al iniciar sesion en ACR. Verifica el nombre y que estes logueado en az cli.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo --------------------------------------------------
echo 2. Auth Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-auth:latest -f backend/auth-service/PetCare.Auth/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-auth:latest

echo.
echo --------------------------------------------------
echo 3. Cliente Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-cliente:latest -f backend/cliente-service/PetCare.Cliente/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-cliente:latest

echo.
echo --------------------------------------------------
echo 4. Cuidador Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-cuidador:latest -f backend/cuidador-service/PetCare.Cuidador/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-cuidador:latest

echo.
echo --------------------------------------------------
echo 5. Request Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-request:latest -f backend/request-service/PetCare.Request/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-request:latest

echo.
echo --------------------------------------------------
echo 6. Payment Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-payment:latest -f backend/payment-service/PetCare.Payment/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-payment:latest

echo.
echo --------------------------------------------------
echo 7. Rating Service
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-calificar:latest -f backend/calificar-servicie/PetCare.Calificar/Dockerfile ./backend
docker push %ACR_NAME%.azurecr.io/petcare-calificar:latest

echo.
echo --------------------------------------------------
echo 8. Frontend
echo --------------------------------------------------
docker build -t %ACR_NAME%.azurecr.io/petcare-frontend:latest -f PetCareSolution-frontend/Dockerfile ./PetCareSolution-frontend
docker push %ACR_NAME%.azurecr.io/petcare-frontend:latest

echo.
echo --------------------------------------------------
echo ✅ Todas las imagenes han sido construidas y subidas exitosamente.
echo --------------------------------------------------
pause
