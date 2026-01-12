// src/services/api/solicitudAPI.js
import axios from 'axios';
import { SolicitudResponse } from '../../models/Solicitud';

const cuidadorApi = axios.create({
  baseURL: import.meta.env.VITE_SOLICITUD_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token automáticamente
cuidadorApi.interceptors.request.use(
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
cuidadorApi.interceptors.response.use(
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

export const solicitudService = {
  // Obtener solicitudes del cuidador autenticado - CORREGIDO EL ENDPOINT
  getMisSolicitudesPendientes: async () => {
    try {
      console.log('Obteniendo solicitudes del cuidador...');
      
      // URL CORREGIDA: /SolicitudCuidador/mis-solicitudes (con "d" y mayúscula)
      const response = await cuidadorApi.get('/SolicitudCuidador/mis-solicitudes');
      console.log('Respuesta recibida:', response.data);
      
      // Mapear la respuesta a nuestro modelo
      const solicitudes = Array.isArray(response.data) 
        ? response.data.map(s => new SolicitudResponse(s))
        : [];
      
      // Filtrar solo las pendientes y asignadas
      const solicitudesPendientes = solicitudes.filter(s => 
        s.estado?.toLowerCase() === 'pendiente' || 
        s.estado?.toLowerCase() === 'asignada'
      );
      
      console.log('Solicitudes pendientes filtradas:', solicitudesPendientes);
      return solicitudesPendientes;
    } catch (error) {
      console.error('Error detallado al obtener solicitudes:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener solicitudes pendientes';
      throw new Error(errorMessage);
    }
  },

  // Obtener todas las solicitudes del cuidador (sin filtrar)
  getMisSolicitudes: async () => {
    try {
      const response = await cuidadorApi.get('/SolicitudCuidador/mis-solicitudes');
      return Array.isArray(response.data) 
        ? response.data.map(s => new SolicitudResponse(s))
        : [];
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener solicitudes';
      throw new Error(errorMessage);
    }
  },

  // Aceptar solicitud - CORREGIDO EL ENDPOINT
  aceptarSolicitud: async (solicitudId) => {
    try {
      const response = await cuidadorApi.post(`/SolicitudCuidador/${solicitudId}/aceptar`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Solicitud aceptada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al aceptar la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Rechazar solicitud - CORREGIDO EL ENDPOINT
  rechazarSolicitud: async (solicitudId) => {
    try {
      const response = await cuidadorApi.post(`/SolicitudCuidador/${solicitudId}/rechazar`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Solicitud rechazada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al rechazar la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Obtener solicitud específica - CORREGIDO EL ENDPOINT
  getSolicitudById: async (id) => {
    try {
      const response = await cuidadorApi.get(`/SolicitudCuidador/${id}`);
      return {
        success: true,
        data: new SolicitudResponse(response.data),
        message: 'Solicitud obtenida exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Iniciar servicio - CORREGIDO EL ENDPOINT
  iniciarServicio: async (solicitudId) => {
    try {
      const response = await cuidadorApi.post(`/SolicitudCuidador/${solicitudId}/iniciar-servicio`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Servicio iniciado exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al iniciar el servicio';
      throw new Error(errorMessage);
    }
  },

  // Finalizar servicio - CORREGIDO EL ENDPOINT
  finalizarServicio: async (solicitudId) => {
    try {
      const response = await cuidadorApi.post(`/SolicitudCuidador/${solicitudId}/finalizar-servicio`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Servicio finalizado exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al finalizar el servicio';
      throw new Error(errorMessage);
    }
  },

  // Test de conexión - CORREGIDO EL ENDPOINT
  testConnection: async () => {
    try {
      // Probar con el endpoint del cuidador directamente
      const response = await cuidadorApi.get('/SolicitudCuidador/mis-solicitudes');
      return {
        success: true,
        data: response.data,
        message: 'Conexión exitosa con el servicio del cuidador'
      };
    } catch (error) {
      // Si falla, probar con el endpoint público de solicitud
      try {
        const response = await cuidadorApi.get('/solicitud/test');
        return {
          success: true,
          data: response.data,
          message: 'Conexión exitosa con el servicio de solicitudes'
        };
      } catch (secondError) {
        throw new Error('Error de conexión con el servicio de solicitudes');
      }
    }
  },

  // Método para debug - obtener información de la configuración
  debugConfig: () => {
    const baseURL = cuidadorApi.defaults.baseURL;
    return {
      baseURL: baseURL,
      fullURL: `${baseURL}/SolicitudCuidador/mis-solicitudes`,
      environment: {
        VITE_SOLICITUD_API_URL: import.meta.env.VITE_SOLICITUD_API_URL,
        VITE_AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL,
        VITE_CAREGIVER_API_URL: import.meta.env.VITE_CAREGIVER_API_URL
      },
      token: localStorage.getItem('token') ? 'Presente' : 'No presente',
      user: localStorage.getItem('user'),
      userInfo: JSON.parse(localStorage.getItem('user') || '{}')
    };
  }
};

export default solicitudService;