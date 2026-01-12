// services/api/cuidadorSolicitudAPI.js
import axios from 'axios';
import { SolicitudResponse } from '../../models/Solicitud';

const cuidadorSolicitudApi = axios.create({
  baseURL: import.meta.env.VITE_SOLICITUD_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token automáticamente
cuidadorSolicitudApi.interceptors.request.use(
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
cuidadorSolicitudApi.interceptors.response.use(
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

export const cuidadorSolicitudService = {
  // Obtener todas las solicitudes del cuidador autenticado
  getMisSolicitudes: async () => {
    try {
      const response = await cuidadorSolicitudApi.get('/SolicitudCuidador/mis-solicitudes');
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

  // Obtener solicitudes activas del cuidador (Aceptada, En Progreso, Fuera de Tiempo)
  getMisSolicitudesActivas: async () => {
    try {
      const response = await cuidadorSolicitudApi.get('/SolicitudCuidador/mis-solicitudes');
      const todasSolicitudes = Array.isArray(response.data) 
        ? response.data.map(s => new SolicitudResponse(s))
        : [];
      
      // Filtrar solo las solicitudes activas
      return todasSolicitudes.filter(solicitud => 
        ['Aceptada', 'En Progreso', 'Fuera de Tiempo'].includes(solicitud.estado)
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al obtener solicitudes activas';
      throw new Error(errorMessage);
    }
  },

  // Obtener solicitud específica
  getSolicitudById: async (id) => {
    try {
      const response = await cuidadorSolicitudApi.get(`/SolicitudCuidador/${id}`);
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

  // Aceptar solicitud
  aceptarSolicitud: async (solicitudId) => {
    try {
      const response = await cuidadorSolicitudApi.post(`/SolicitudCuidador/${solicitudId}/aceptar`);
      return {
        success: true,
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

  // Rechazar solicitud
  rechazarSolicitud: async (solicitudId) => {
    try {
      const response = await cuidadorSolicitudApi.post(`/SolicitudCuidador/${solicitudId}/rechazar`);
      return {
        success: true,
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

  // Iniciar servicio
  iniciarServicio: async (solicitudId) => {
    try {
      const response = await cuidadorSolicitudApi.post(`/SolicitudCuidador/${solicitudId}/iniciar-servicio`);
      return {
        success: true,
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

  // Finalizar servicio
  finalizarServicio: async (solicitudId) => {
    try {
      const response = await cuidadorSolicitudApi.post(`/SolicitudCuidador/${solicitudId}/finalizar-servicio`);
      return {
        success: true,
        message: response.data?.message || 'Servicio finalizado exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al finalizar el servicio';
      throw new Error(errorMessage);
    }
  }
};

export default cuidadorSolicitudService;