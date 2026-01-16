// hooks/useCuidador.js
import { useState, useEffect } from 'react';
import { caregiverService } from '../services/api/caregiverAPI';
import { CuidadorResponse } from '../models/Cuidador';

export const useCuidador = (token) => {
  const [cuidador, setCuidador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCuidadorProfile = async (currentToken) => {
    // Verificar si hay token antes de hacer la llamada
    if (!currentToken) {
      setLoading(false);
      setError('No hay token disponible');
      return;
    }

    try {
      const response = await caregiverService.getProfile(currentToken);
      
      if (response.success && response.data) {
        setCuidador(new CuidadorResponse(response.data));
        setError(null);
      } else {
        setError(response.error || 'No se encontró perfil de cuidador');
        setCuidador(null);
      }
    } catch (error) {
      setError(error.message || 'Error al cargar el perfil');
      setCuidador(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuidadorProfile(token);
  }, [token]);

  const refetch = () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      setLoading(true);
      fetchCuidadorProfile(currentToken);
    }
  };

  return {
    cuidador,
    loading,
    error,
    refetch
  };
};