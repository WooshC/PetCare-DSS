// hooks/useCuidador.js
import { useState, useEffect } from 'react';
import { caregiverService } from '../services/api/caregiverAPI';
import { CuidadorResponse } from '../models/Cuidador';

export const useCuidador = (token) => {
  const [cuidador, setCuidador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCuidadorProfile = async () => {
      // Verificar si hay token antes de hacer la llamada
      if (!token) {
        setLoading(false);
        setError('No hay token disponible');
        return;
      }

      try {
        const response = await caregiverService.getProfile(token);
        
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

    fetchCuidadorProfile();
  }, [token]);

  const refetch = () => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      setLoading(true);
      fetchCuidadorProfile();
    }
  };

  return {
    cuidador,
    loading,
    error,
    refetch
  };
};