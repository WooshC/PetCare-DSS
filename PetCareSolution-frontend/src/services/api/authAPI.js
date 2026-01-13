// services/api/authAPI.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  login: async (credentials) => {
    try {
      console.log('🚀 [authAPI] Intentando login con:', {
        email: credentials.email,
      });

      // ✅ SOLUCIÓN: Usar nombres en español Y agregar IdentificadorArrendador
      const payload = {
        Correo: credentials.email,                    // ✅ Cambio: Email → Correo
        Contraseña: credentials.password,              // ✅ Cambio: Password → Contraseña
        IdentificadorArrendador: 'petcare-default'     // ✅ NUEVO: Campo requerido por LoginRequest.cs
      };

      console.log('📤 [authAPI] Payload de login:', {
        Correo: payload.Correo,
        Contraseña: '***',
        IdentificadorArrendador: payload.IdentificadorArrendador
      });

      const response = await api.post('/login', payload);

      console.log('✅ [authAPI] Login exitoso:', response.data);

      const backendData = response.data;

      if (backendData.success && backendData.token) {
        const rawRole = backendData.user?.roles?.[0] || 'Usuario';
        const normalizedRole = rawRole.toLowerCase();

        const userData = {
          id: backendData.user?.id,
          name: backendData.user?.name || credentials.email.split('@')[0],
          email: credentials.email,
          phoneNumber: backendData.user?.phoneNumber || '',
          role: normalizedRole,
          rawRole: rawRole,
        };

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
      console.error('❌ [authAPI] Error en login:', error);
      console.error('📋 [authAPI] Detalle del error:', error.response?.data);
      console.error('🔍 [authAPI] Status code:', error.response?.status);
      
      // Mejorar mensajes de error de validación
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = Object.entries(error.response.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join(' | ');
        throw new Error(`Errores de validación: ${validationErrors}`);
      }
      
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

      try {
        const response = await authService.getCurrentUser(token);
        return {
          isValid: true,
          user: response.user
        };
      } catch (error) {
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
      console.log('🚀 [authAPI] Iniciando registro con datos:', userData);
      
      const payload = {
        Correo: userData.email,
        Contraseña: userData.password,
        Nombre: userData.name,
        Telefono: userData.phoneNumber,
        IdentificadorArrendador: 'petcare-default',
        Rol: userData.role
      };

      console.log('📤 [authAPI] Payload transformado:', payload);

      const response = await api.post('/register', payload);

      console.log('✅ [authAPI] Respuesta del servidor:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      const userInfo = {
        id: null,
        name: payload.Nombre,
        email: payload.Correo,
        phoneNumber: payload.Telefono,
        role: payload.Rol.toLowerCase()
      };

      localStorage.setItem('user', JSON.stringify(userInfo));

      return {
        success: true,
        token: response.data.token,
        user: userInfo,
        message: response.data.message || 'Usuario registrado exitosamente'
      };

    } catch (error) {
      console.error('❌ [authAPI] Error en registro:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.response?.data?.errors?.[0] ||
                          error.message || 
                          'Error al registrar usuario';
      
      return {
        success: false,
        error: errorMessage
      };
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