// services/api/combinedAPI.js
import axios from 'axios';
import { CuidadorResponse } from '../../models/Cuidador';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const caregiverApi = axios.create({
  baseURL: import.meta.env.VITE_CAREGIVER_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors para agregar token automáticamente
[authApi, caregiverApi].forEach(api => {
  api.interceptors.request.use(
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

  api.interceptors.response.use(
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
});

export const combinedService = {
  // Obtener cuidadores con información completa de usuario
  getCuidadoresConUsuarios: async () => {
    try {
      // 1. Obtener lista de cuidadores
      const cuidadoresResponse = await caregiverApi.get('/');
      const cuidadores = Array.isArray(cuidadoresResponse.data) 
        ? cuidadoresResponse.data.map(c => new CuidadorResponse(c))
        : [];

      // 2. Obtener lista de usuarios
      const usuariosResponse = await authApi.get('/users');
      const usuarios = Array.isArray(usuariosResponse.data) ? usuariosResponse.data : [];

      // 3. Combinar la información
      const cuidadoresCompletos = cuidadores.map(cuidador => {
        // Buscar el usuario correspondiente por usuarioID
        const usuario = usuarios.find(u => u.id === cuidador.usuarioID);
        
        return new CuidadorResponse({
          ...cuidador,
          nombreUsuario: usuario?.name || 'Cuidador',
          emailUsuario: usuario?.email || '',
          telefonoUsuario: usuario?.phoneNumber || ''
        });
      });

      return cuidadoresCompletos;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener cuidadores con información de usuario';
      throw new Error(errorMessage);
    }
  },

  // Obtener un cuidador específico con información de usuario
  getCuidadorCompletoById: async (cuidadorId) => {
    try {
      // 1. Obtener el cuidador
      const cuidadorResponse = await caregiverApi.get(`/${cuidadorId}`);
      const cuidador = new CuidadorResponse(cuidadorResponse.data);

      // 2. Obtener información del usuario
      const usuarioResponse = await authApi.get(`/users/${cuidador.usuarioID}`);
      const usuario = usuarioResponse.data;

      // 3. Combinar la información
      return new CuidadorResponse({
        ...cuidador,
        nombreUsuario: usuario?.name || 'Cuidador',
        emailUsuario: usuario?.email || '',
        telefonoUsuario: usuario?.phoneNumber || ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener el cuidador completo';
      throw new Error(errorMessage);
    }
  }
};

export default combinedService;