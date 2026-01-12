import axios from 'axios';
import { ClienteRequest, ClienteResponse } from '../../models/Cliente';

const CLIENT_API_URL = import.meta.env.VITE_CLIENT_API_URL;

const clientApi = axios.create({
  baseURL: CLIENT_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Helper para obtener el usuario del token
const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  } catch (error) {
    console.error('Error obteniendo usuario del localStorage:', error);
    return {};
  }
};

export const clientService = {
  /**
   * Obtiene el perfil del cliente actual
   */
  async getProfile(token) {
    try {
      console.log('🔄 Obteniendo perfil de cliente...');
      
      const response = await clientApi.get('/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Perfil de cliente obtenido:', response.data);
      
      return { 
        success: true, 
        data: new ClienteResponse(response.data) 
      };
    } catch (error) {
      console.error('❌ Error obteniendo perfil de cliente:', error);
      
      // Si es 404, el perfil no existe
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'Perfil de cliente no encontrado. Debes crear tu perfil primero.',
          status: 404 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al cargar el perfil del cliente' 
      };
    }
  },

  /**
   * Crea un nuevo perfil de cliente
   */
  async createProfile(profileData, token) {
    try {
      console.log('🔄 Creando perfil de cliente...', profileData);
      
      const user = getCurrentUser();
      const requestData = new ClienteRequest(
        profileData.documentoIdentidad,
        profileData.telefonoEmergencia
      );

      const response = await clientApi.post('/', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Perfil de cliente creado:', response.data);
      
      return { 
        success: true, 
        data: new ClienteResponse(response.data),
        message: 'Perfil de cliente creado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error creando perfil de cliente:', error);
      
      // Manejar errores específicos del backend
      let errorMessage = 'Error al crear el perfil del cliente';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos de entrada inválidos';
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data?.message || 'Ya existe un perfil de cliente para este usuario';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  /**
   * Actualiza el perfil del cliente actual
   */
  async updateProfile(profileData, token) {
    try {
      console.log('🔄 Actualizando perfil de cliente...', profileData);
      
      const requestData = new ClienteRequest(
        profileData.documentoIdentidad,
        profileData.telefonoEmergencia
      );

      const response = await clientApi.put('/mi-perfil', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Perfil de cliente actualizado:', response.data);
      
      return { 
        success: true, 
        data: new ClienteResponse(response.data),
        message: 'Perfil actualizado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error actualizando perfil de cliente:', error);
      
      let errorMessage = 'Error al actualizar el perfil';
      
      if (error.response?.status === 404) {
        errorMessage = 'Perfil de cliente no encontrado';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Datos de entrada inválidos';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  /**
   * Elimina el perfil del cliente actual (soft delete)
   */
  async deleteProfile(token) {
    try {
      console.log('🔄 Eliminando perfil de cliente...');
      
      const response = await clientApi.delete('/mi-perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Perfil de cliente eliminado:', response.data);
      
      return { 
        success: true, 
        data: response.data,
        message: 'Perfil eliminado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error eliminando perfil de cliente:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al eliminar el perfil' 
      };
    }
  },

  /**
   * Obtiene todos los clientes (solo para admin)
   */
  async getAllClients(token) {
    try {
      console.log('🔄 Obteniendo lista de clientes...');
      
      const response = await clientApi.get('/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const clients = Array.isArray(response.data) 
        ? response.data.map(client => new ClienteResponse(client))
        : [];

      console.log(`✅ ${clients.length} clientes obtenidos`);
      
      return { 
        success: true, 
        data: clients 
      };
    } catch (error) {
      console.error('❌ Error obteniendo lista de clientes:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al cargar los clientes' 
      };
    }
  },

  /**
   * Obtiene un cliente por ID
   */
  async getClientById(clientId, token) {
    try {
      console.log(`🔄 Obteniendo cliente con ID: ${clientId}`);
      
      const response = await clientApi.get(`/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Cliente obtenido:', response.data);
      
      return { 
        success: true, 
        data: new ClienteResponse(response.data) 
      };
    } catch (error) {
      console.error('❌ Error obteniendo cliente por ID:', error);
      
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'Cliente no encontrado' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al cargar el cliente' 
      };
    }
  },

  /**
   * Verifica el documento de un cliente (solo para admin)
   */
  async verifyDocument(clientId, token) {
    try {
      console.log(`🔄 Verificando documento del cliente ID: ${clientId}`);
      
      const response = await clientApi.post(`/${clientId}/verificar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Documento verificado:', response.data);
      
      return { 
        success: true, 
        data: response.data,
        message: 'Documento verificado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error verificando documento:', error);
      
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'Cliente no encontrado' 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al verificar el documento' 
      };
    }
  },

  /**
   * Valida si el usuario actual tiene un perfil de cliente
   */
  async validateClientProfile(token) {
    try {
      const response = await this.getProfile(token);
      
      if (response.success && response.data) {
        return {
          success: true,
          hasProfile: true,
          profile: response.data,
          isVerified: response.data.documentoVerificado
        };
      } else {
        return {
          success: true,
          hasProfile: false,
          profile: null,
          error: response.error
        };
      }
    } catch (error) {
      console.error('❌ Error validando perfil de cliente:', error);
      return {
        success: false,
        hasProfile: false,
        error: 'Error al validar el perfil de cliente'
      };
    }
  }
};

export default clientService;