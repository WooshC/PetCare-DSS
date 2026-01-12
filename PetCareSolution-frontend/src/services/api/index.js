// src/services/api/index.js (temporal)
// Servicios temporales - comenta las funciones que no existen aún

export const caregiverService = {
  getProfile: async (token) => {
    // Simular datos temporales del cuidador
    return {
      success: true,
      data: {
        nombreUsuario: 'Juan Pérez',
        emailUsuario: 'juan@example.com',
        documentoIdentidad: '1234567890',
        telefonoEmergencia: '+593 987654321',
        documentoVerificado: true,
        fechaCreacion: new Date().toISOString(),
        biografia: 'Cuidador profesional con 5 años de experiencia en el cuidado de mascotas.',
        experiencia: 'Especializado en cuidado de perros y gatos. He trabajado con más de 50 mascotas.',
        horarioAtencion: 'Lunes a Viernes: 8:00 - 18:00',
        tarifaPorHora: 15,
        calificacionPromedio: 4.8
      }
    };
  }
};

export const solicitudService = {
  getMisSolicitudesPendientes: async (token) => {
    // Simular datos temporales de solicitudes
    return [
      {
        solicitudID: 1,
        tipoServicio: 'Paseo de Mascotas',
        descripcion: 'Necesito que paseen a mi perro Golden Retriever de 2 años por 1 hora.',
        fechaHoraInicio: new Date(Date.now() + 86400000).toISOString(), // mañana
        duracionHoras: 1,
        ubicacion: 'Quito, Ecuador',
        estado: 'Pendiente',
        fechaCreacion: new Date().toISOString(),
        nombreCliente: 'María González',
        emailCliente: 'maria@example.com',
        telefonoCliente: '+593 987654321'
      },
      {
        solicitudID: 2,
        tipoServicio: 'Cuidado Diario',
        descripcion: 'Busco cuidado para mi gato siamés mientras estoy de viaje 3 días.',
        fechaHoraInicio: new Date(Date.now() + 172800000).toISOString(), // pasado mañana
        duracionHoras: 3,
        ubicacion: 'Guayaquil, Ecuador',
        estado: 'Pendiente',
        fechaCreacion: new Date().toISOString(),
        nombreCliente: 'Carlos Rodríguez',
        emailCliente: 'carlos@example.com',
        telefonoCliente: '+593 987654322'
      }
    ];
  },

  getMisSolicitudesActivas: async (token) => {
    // Simular datos temporales de solicitudes activas
    return [
      {
        solicitudID: 3,
        tipoServicio: 'Guardería Diurna',
        descripcion: 'Cuidado de mi perro labrador durante el día mientras trabajo.',
        fechaHoraInicio: new Date().toISOString(),
        duracionHoras: 8,
        ubicacion: 'Cuenca, Ecuador',
        estado: 'Aceptada',
        fechaCreacion: new Date(Date.now() - 86400000).toISOString(), // ayer
        nombreCliente: 'Ana Martínez',
        emailCliente: 'ana@example.com',
        telefonoCliente: '+593 987654323'
      }
    ];
  },

  aceptarSolicitud: async (id, token) => {
    console.log('Aceptando solicitud:', id);
    // Simular aceptación exitosa
    return { success: true, message: 'Solicitud aceptada correctamente' };
  },

  rechazarSolicitud: async (id, token) => {
    console.log('Rechazando solicitud:', id);
    // Simular rechazo exitoso
    return { success: true, message: 'Solicitud rechazada correctamente' };
  },

  iniciarServicio: async (id, token) => {
    console.log('Iniciando servicio:', id);
    // Simular inicio exitoso
    return { success: true, message: 'Servicio iniciado correctamente' };
  },

  finalizarServicio: async (id, token) => {
    console.log('Finalizando servicio:', id);
    // Simular finalización exitosa
    return { success: true, message: 'Servicio finalizado correctamente' };
  }
};

export * from './ratingsAPI';

