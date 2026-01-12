// hooks/useCuidadores.js
import { useState, useEffect, useCallback } from 'react';
import { combinedService } from '../services/api/combinedAPI';
import { CuidadorResponse } from '../models/Cuidador';

export const useCuidadores = () => {
  const [cuidadores, setCuidadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCuidadores = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await combinedService.getCuidadoresConUsuarios();
      setCuidadores(data);
      
      return data;
    } catch (err) {
      console.error('Error loading cuidadores:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuidadores();
  }, [loadCuidadores]);

  return {
    cuidadores,
    loading,
    error,
    loadCuidadores,
    
    // Propiedades computadas
    cuidadoresVerificados: cuidadores.filter(c => c.documentoVerificado),
    cuidadoresConAltaCalificacion: cuidadores.filter(c => c.calificacionPromedio >= 4.0),
    cuidadoresConTarifaAccesible: cuidadores.filter(c => c.tarifaPorHora <= 30),
    
    // Métodos de filtrado
    filtrarPorCalificacion: (minCalificacion) => 
      cuidadores.filter(c => c.calificacionPromedio >= minCalificacion),
    filtrarPorTarifa: (maxTarifa) => 
      cuidadores.filter(c => c.tarifaPorHora <= maxTarifa),
    filtrarPorVerificacion: () => 
      cuidadores.filter(c => c.documentoVerificado)
  };
};