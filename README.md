
# PetCare-DSS
Un sistema web que conecta dueños de mascotas con cuidadores de confianza, ofreciendo gestión de servicios, calificaciones y pagos.

## Conexión a Base de Datos (SQL Server Management Studio - SSMS)

Para conectarte a las bases de datos de los microservicios desplegados en Docker desde tu máquina local, utiliza la siguiente configuración:

### Datos de Autenticación (Comunes para todas)
*   **Authentication Type:** SQL Server Authentication
*   **Login:** `sa`
*   **Password:** `YourStrong@Passw0rd`
*   **Trust Server Certificate:** Sí (Check en Options > Connection Properties > Trust server certificate)

### Servidores y Bases de Datos

| Servicio       | Server Name (Host,Port) | Nombre BD Interna  |
| :------------- | :---------------------- | :----------------- |
| **Auth**       | `localhost,14331`       | `PetCareAuth`      |
| **Cliente**    | `localhost,14332`       | `PetCareCliente`   |
| **Cuidador**   | `localhost,14333`       | `PetCareCuidador`  |
| **Request**    | `localhost,14334`       | `PetCareRequest`   |
| **Payment**    | `localhost,14335`       | `PetCarePayment`   |
| **Calificar**  | `localhost,14336`       | `PetCareCalificar` |