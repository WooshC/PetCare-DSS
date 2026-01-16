// src/hooks/useSolicitudes.js
import { useState, useEffect, useCallback } from 'react';
import { solicitudService } from '../services/api/solicitudAPI';
import { SolicitudEstados } from '../models/Solicitud';

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await solicitudService.getMisSolicitudesPendientes();

      setSolicitudesPendientes(data);
      return data;
    } catch (err) {
      console.error('Error detallado en hook:', err);
      const errorMessage = err.message || 'Error al cargar las solicitudes';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTodasSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await solicitudService.getMisSolicitudes();
      setSolicitudes(data);
      return data;
    } catch (err) {
      console.error('Error loading all solicitudes:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const aceptarSolicitud = async (solicitudId) => {
    try {
      setError(null);
      const result = await solicitudService.aceptarSolicitud(solicitudId);
      await loadSolicitudes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('Error accepting solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const rechazarSolicitud = async (solicitudId) => {
    try {
      setError(null);
      const result = await solicitudService.rechazarSolicitud(solicitudId);
      await loadSolicitudes();
      return { success: true, message: result.message };
    } catch (err) {
      console.error('Error rejecting solicitud:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const testConnection = async () => {
    try {
      const result = await solicitudService.testConnection();
      return result;
    } catch (err) {
      console.error('Error testing connection:', err);
      return { success: false, message: err.message };
    }
  };

  const getDebugInfo = () => {
    return solicitudService.debugConfig();
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
    solicitudes: solicitudesPendientes,
    todasLasSolicitudes: solicitudes,
    loading,
    error,

    // Acciones de carga
    loadSolicitudes,
    loadTodasSolicitudes,

    // Acciones sobre solicitudes
    aceptarSolicitud,
    rechazarSolicitud,

    // Utilidades
    testConnection,
    getDebugInfo,

    // Propiedades computadas
    solicitudesPendientes: solicitudesPendientes,
    totalPendientes: solicitudesPendientes.length
  };
};