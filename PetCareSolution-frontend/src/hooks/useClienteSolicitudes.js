// src/hooks/useClienteSolicitudes.js
import { useState, useEffect, useCallback } from 'react';
import { clienteSolicitudService } from '../services/api/clienteSolicitudAPI';
import { SolicitudEstados } from '../models/Solicitud';

export const useClienteSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clienteSolicitudService.getMisSolicitudes();
      setSolicitudes(data);
      return data;
    } catch (err) {
      console.error('Error loading solicitudes:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSolicitud = async (solicitudData) => {
    try {
      setError(null);
      const result = await clienteSolicitudService.createSolicitud(solicitudData);
      await loadSolicitudes(); // Recargar la lista
      return { success: true, data: result.data, message: result.message };
    } catch (err) {
      console.error('Error creating solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateSolicitud = async (solicitudId, solicitudData) => {
    try {
      setError(null);
      const result = await clienteSolicitudService.updateSolicitud(solicitudId, solicitudData);
      await loadSolicitudes();
      return { success: true, data: result.data, message: result.message };
    } catch (err) {
      console.error('Error updating solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const asignarCuidador = async (solicitudId, cuidadorId) => {
    try {
      setError(null);
      const result = await clienteSolicitudService.asignarCuidador(solicitudId, cuidadorId);
      await loadSolicitudes();
      return { success: true, data: result.data, message: result.message };
    } catch (err) {
      console.error('Error assigning cuidador:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const cancelarSolicitud = async (solicitudId) => {
    try {
      setError(null);
      const result = await clienteSolicitudService.cancelarSolicitud(solicitudId);
      await loadSolicitudes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('Error canceling solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteSolicitud = async (solicitudId) => {
    try {
      setError(null);
      const result = await clienteSolicitudService.deleteSolicitud(solicitudId);
      await loadSolicitudes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('Error deleting solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Filtros
  const getSolicitudesPendientes = () => {
    return solicitudes.filter(s => s.estado === SolicitudEstados.PENDIENTE);
  };

  const getSolicitudesAceptadas = () => {
    return solicitudes.filter(s => s.estado === SolicitudEstados.ACEPTADA);
  };

  const getSolicitudesEnProgreso = () => {
    return solicitudes.filter(s => s.estado === SolicitudEstados.EN_PROGRESO);
  };

  const getSolicitudesFinalizadas = () => {
    return solicitudes.filter(s => s.estado === SolicitudEstados.FINALIZADA);
  };

  useEffect(() => {
    loadSolicitudes();

    // Polling cada 30 segundos
    const intervalId = setInterval(() => {
      loadSolicitudes();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadSolicitudes]);

  return {
    // Estados
    solicitudes,
    loading,
    error,

    // Acciones
    loadSolicitudes,
    createSolicitud,
    updateSolicitud,
    asignarCuidador,
    cancelarSolicitud,
    deleteSolicitud,

    // Filtros
    getSolicitudesPendientes,
    getSolicitudesAceptadas,
    getSolicitudesEnProgreso,
    getSolicitudesFinalizadas,

    // Propiedades computadas
    solicitudesPendientes: getSolicitudesPendientes(),
    solicitudesAceptadas: getSolicitudesAceptadas(),
    solicitudesEnProgreso: getSolicitudesEnProgreso(),
    solicitudesFinalizadas: getSolicitudesFinalizadas(),

    // Contadores
    total: solicitudes.length,
    totalPendientes: getSolicitudesPendientes().length,
    totalAceptadas: getSolicitudesAceptadas().length,
    totalEnProgreso: getSolicitudesEnProgreso().length,
    totalFinalizadas: getSolicitudesFinalizadas().length
  };
};