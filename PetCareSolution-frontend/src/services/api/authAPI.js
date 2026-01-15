// services/api/authAPI.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', {
        Correo: credentials.email,
        Contraseña: credentials.password,
        IdentificadorArrendador: credentials.identificadorArrendador || 'petcare-ecuador',
      });

      const backendData = response.data;

      if (backendData.success && backendData.token) {
        // Normalizar el rol
        const rawRole = backendData.user?.roles?.[0] || 'Usuario';
        const normalizedRole = rawRole.toLowerCase();

        const userData = {
          id: backendData.user?.id,
          name: backendData.user?.name || credentials.email.split('@')[0],
          email: credentials.email,
          phoneNumber: backendData.user?.phoneNumber || '',
          role: normalizedRole, // Usar el rol normalizado
          rawRole: rawRole, // Guardar también el rol original
        };

        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', backendData.token);

        return {
          success: true,
          token: backendData.token,
          user: userData,
          message: backendData.message,
        };
      }

      throw new Error('Respuesta del servidor inválida');
    } catch (error) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Error en el login');
    }
  },

  validateExistingSession: async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token || !userData.id) {
        return { isValid: false };
      }

      // Verificar si el token es válido llamando al endpoint de usuario actual
      try {
        const response = await authService.getCurrentUser(token);
        return {
          isValid: true,
          user: response.user
        };
      } catch (error) {
        // Limpiar datos inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isValid: false };
      }
    } catch (error) {
      return { isValid: false };
    }
  },


  getCompleteUserData: async (token) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber || '',
        role: response.data.roles?.[0] || 'Usuario',
      };

      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error obteniendo datos del usuario');
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register', {
        Correo: userData.email,
        Contraseña: userData.password,
        Nombre: userData.name,
        Telefono: userData.phoneNumber,
        Rol: userData.role,
        IdentificadorArrendador: userData.identificadorArrendador || 'petcare-ecuador',
      });

      const backendData = response.data;

      const registeredUser = {
        id: backendData.user?.id,
        name: backendData.user?.name || userData.name,
        email: userData.email,
        phoneNumber: backendData.user?.phoneNumber || userData.phoneNumber,
        role: backendData.user?.role || userData.role,
      };

      if (backendData.token) {
        localStorage.setItem('user', JSON.stringify(registeredUser));
        localStorage.setItem('token', backendData.token);
      }

      return {
        success: backendData.success,
        token: backendData.token,
        user: registeredUser,
        message: backendData.message,
        error: backendData.error,
      };
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = 'Error en el registro';

      if (errorData) {
        if (errorData.errors) {
          // Capturar errores de validación (ModelState)
          errorMessage = Object.values(errorData.errors).flat().join('. ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }

      throw new Error(errorMessage);
    }
  },

  getCurrentUser: async (token) => {
    try {
      const response = await api.get('/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawRole = response.data.roles?.[0] || 'Usuario';
      const normalizedRole = rawRole.toLowerCase();

      const userData = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber || '',
        role: normalizedRole,
        rawRole: rawRole,
      };

      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error obteniendo usuario actual');
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/reset-password', { Email: email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error solicitando reset de contraseña');
    }
  },
};

export default authService;