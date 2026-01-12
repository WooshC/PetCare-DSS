// src/services/api/clienteSolicitudAPI.js
import axios from 'axios';
import { SolicitudResponse, SolicitudRequest, AsignarCuidadorRequest } from '../../models/Solicitud';

const clienteSolicitudApi = axios.create({
  baseURL: import.meta.env.VITE_SOLICITUD_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar el token automáticamente
clienteSolicitudApi.interceptors.request.use(
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
clienteSolicitudApi.interceptors.response.use(
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

export const clienteSolicitudService = {
  // Obtener solicitudes del cliente autenticado
  getMisSolicitudes: async () => {
    try {
      const response = await clienteSolicitudApi.get('/SolicitudCliente/mis-solicitudes');
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

  // Obtener solicitud específica
  getSolicitudById: async (id) => {
    try {
      const response = await clienteSolicitudApi.get(`/SolicitudCliente/${id}`);
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

  // Crear nueva solicitud
  createSolicitud: async (solicitudData) => {
    try {
      const request = new SolicitudRequest(solicitudData);
      const response = await clienteSolicitudApi.post('/SolicitudCliente', request);
      return {
        success: true,
        data: new SolicitudResponse(response.data),
        message: 'Solicitud creada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al crear la solicitud';
      throw new Error(errorMessage);
    }
  },

  // Actualizar solicitud
  updateSolicitud: async (id, solicitudData) => {
    try {
      const request = new SolicitudRequest(solicitudData);
      const response = await clienteSolicitudApi.put(`/SolicitudCliente/${id}`, request);
      return {
        success: true,
        data: new SolicitudResponse(response.data),
        message: 'Solicitud actualizada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al actualizar la solicitud';
      throw new Error(errorMessage);
    }
  },
  

  // Asignar cuidador a solicitud
  asignarCuidador: async (solicitudId, cuidadorId) => {
    try {
      const request = new AsignarCuidadorRequest(cuidadorId);
      const response = await clienteSolicitudApi.put(`/SolicitudCliente/${solicitudId}/asignar-cuidador`, request);
      return {
        success: true,
        data: new SolicitudResponse(response.data),
        message: 'Cuidador asignado exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al asignar cuidador';
      throw new Error(errorMessage);
    }
  },

  // Cancelar solicitud
  cancelarSolicitud: async (solicitudId) => {
    try {
      const response = await clienteSolicitudApi.post(`/SolicitudCliente/${solicitudId}/cancelar`);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'Solicitud cancelada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al cancelar la solicitud';
      throw new Error(errorMessage);
    }
  },

  

  // Eliminar solicitud
  deleteSolicitud: async (solicitudId) => {
    try {
      await clienteSolicitudApi.delete(`/SolicitudCliente/${solicitudId}`);
      return {
        success: true,
        message: 'Solicitud eliminada exitosamente'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Error al eliminar la solicitud';
      throw new Error(errorMessage);
    }
  }
};



export default clienteSolicitudService;