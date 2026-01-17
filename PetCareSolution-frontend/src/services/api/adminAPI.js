import axios from 'axios';

// Usaremos la API de Auth como base para el admin, ya que AdminController está ahí
const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5043/api', // Fallback, pero debería estar en env
    headers: { 'Content-Type': 'application/json' },
});

// APIs específicas para Clientes y Cuidadores (si necesitamos llamar para verificarlos)
// Estos endpoints están en los servicios respectivos:
// Cliente: POST /api/cliente/{id}/verificar (requiere admin role token)
// Cuidador: POST /api/cuidador/{id}/verificar (requiere admin role token)

const clienteApi = axios.create({
    baseURL: import.meta.env.VITE_CLIENT_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

const cuidadorApi = axios.create({
    baseURL: import.meta.env.VITE_CAREGIVER_API_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const adminService = {
    // Listar todos los usuarios del tenant (esto lo maneja AdminController en Auth Service)
    getUsers: async (token) => {
        try {
            const response = await authApi.get('/Admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || error.message);
        }
    },

    // Obtener lista completa de clientes (para ver estado de verificación)
    // Usamos el endpoint GET /api/cliente que protegimos con [Authorize(Roles="Admin")]
    getAllClientes: async (token) => {
        try {
            const response = await clienteApi.get('/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching clientes:", error);
            // Si falla, devolvemos array vacío para no romper la UI
            return [];
        }
    },

    // Obtener lista completa de cuidadores (para ver estado de verificación)
    // Usamos el endpoint GET /api/cuidador que está disponible con autenticación
    getAllCuidadores: async (token) => {
        try {
            const response = await cuidadorApi.get('/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching cuidadores:", error);
            // Si falla devolver vacío
            return [];
        }
    },

    // Verificar Documento Cliente
    verifyCliente: async (token, id) => {
        try {
            const response = await clienteApi.post(`/${id}/verificar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    // Verificar Documento Cuidador
    verifyCuidador: async (token, id) => {
        try {
            const response = await cuidadorApi.post(`/${id}/verificar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }
};
