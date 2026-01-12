// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/api/authAPI';
import { Usuario } from '../models/Usuario';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Intentar obtener datos frescos del servidor
        try {
          const result = await authService.getCurrentUser(token);
          if (result.success) {
            const usuario = new Usuario(result.user);
            setUser(usuario);
            return;
          }
        } catch (error) {
          console.warn('No se pudieron obtener datos frescos, usando cache:', error.message);
        }

        // Fallback: usar datos del localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.id) {
          const usuario = new Usuario(userData);
          setUser(usuario);
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const usuario = new Usuario(result.user);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(usuario));
        setUser(usuario);
        return { success: true, user: usuario };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const result = await authService.getCurrentUser(token);
        if (result.success) {
          const usuario = new Usuario(result.user);
          setUser(usuario);
          localStorage.setItem('user', JSON.stringify(usuario));
        }
      } catch (error) {
        console.error('Error refrescando usuario:', error);
      }
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  };
};