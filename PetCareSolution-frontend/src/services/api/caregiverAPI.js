// services/api/caregiverAPI.js
import axios from 'axios';
import { CuidadorResponse } from '../../models/Cuidador';

const CAREGIVER_API_URL = import.meta.env.VITE_CAREGIVER_API_URL;

// Crear instancia de axios para cuidadores
const caregiverApi = axios.create({
  baseURL: CAREGIVER_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token automáticamente
caregiverApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
caregiverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const caregiverService = {
  // Perfil del cuidador autenticado
  createProfile: async (profileData) => {
    try {
      const response = await caregiverApi.post('/', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error creando perfil de cuidador');
    }
  },

  getProfile: async () => {
    try {
      const response = await caregiverApi.get('/mi-perfil');
      const profileData = response.data;

      if (profileData && (profileData.cuidadorID || profileData.usuarioID)) {
        return {
          success: true,
          data: profileData
        };
      } else {
        return {
          success: false,
          error: 'Perfil no encontrado'
        };
      }
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'No tienes un perfil de cuidador. Crea uno para comenzar.'
        };
      }
      throw new Error(error.response?.data?.error || 'Error obteniendo perfil de cuidador');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await caregiverApi.put('/mi-perfil', profileData);
      return {
        success: true,
        data: response.data,
        message: 'Perfil actualizado correctamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                           error.response?.data?.message ||
                           'Error al actualizar el perfil';
      throw new Error(errorMessage);
    }
  },

  // Lista de cuidadores (para clientes) - CORREGIDO: usar solo '/'
  getAllCuidadores: async () => {
    try {
      const response = await caregiverApi.get('/');
      return Array.isArray(response.data) 
        ? response.data.map(c => new CuidadorResponse(c))
        : [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener cuidadores';
      throw new Error(errorMessage);
    }
  },

  getCuidadorById: async (cuidadorId) => {
    try {
      const response = await caregiverApi.get(`/${cuidadorId}`);
      return {
        success: true,
        data: new CuidadorResponse(response.data),
        message: 'Cuidador obtenido exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener el cuidador';
      throw new Error(errorMessage);
    }
  },

  getCuidadoresDisponibles: async (filtros = {}) => {
    try {
      const response = await caregiverApi.get('/', {
        params: filtros
      });
      return Array.isArray(response.data) 
        ? response.data.map(c => new CuidadorResponse(c))
        : [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener cuidadores disponibles';
      throw new Error(errorMessage);
    }
  }
};

export default caregiverService;