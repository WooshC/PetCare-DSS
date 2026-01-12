// src/models/Solicitud.js
export const SolicitudEstados = {
  PENDIENTE: 'Pendiente',
  ASIGNADA: 'Asignada',
  ACEPTADA: 'Aceptada',
  EN_PROGRESO: 'En Progreso',
  FINALIZADA: 'Finalizada',
  RECHAZADA: 'Rechazada',
  CANCELADA: 'Cancelada'
};

export const SolicitudTiposServicio = {
  PASEO: 'Paseo de Mascotas',
  CUIDADO_DIARIO: 'Cuidado Diario',
  GUARDERIA: 'Guardería',
  VISITA_DOMICILIO: 'Visita a Domicilio',
  HOSPEDAJE: 'Hospedaje'
};

// Modelo base de Solicitud
export class Solicitud {
  constructor(data = {}) {
    this.solicitudID = data.solicitudID || 0;
    this.clienteID = data.clienteID || null;
    this.cuidadorID = data.cuidadorID || null;
    this.tipoServicio = data.tipoServicio || '';
    this.descripcion = data.descripcion || '';
    this.fechaHoraInicio = data.fechaHoraInicio || '';
    this.duracionHoras = data.duracionHoras || 0;
    this.ubicacion = data.ubicacion || '';
    this.estado = data.estado || SolicitudEstados.PENDIENTE;
    this.fechaCreacion = data.fechaCreacion || '';
    this.fechaActualizacion = data.fechaActualizacion || null;
    this.fechaAceptacion = data.fechaAceptacion || null;
    this.fechaInicioServicio = data.fechaInicioServicio || null;
    this.fechaFinalizacion = data.fechaFinalizacion || null;
  }
}

// Modelo de respuesta de Solicitud (con información enriquecida)
export class SolicitudResponse extends Solicitud {
  constructor(data = {}) {
    super(data);
    this.nombreCliente = data.nombreCliente || '';
    this.emailCliente = data.emailCliente || '';
    this.telefonoCliente = data.telefonoCliente || '';
    this.nombreCuidador = data.nombreCuidador || '';
    this.emailCuidador = data.emailCuidador || '';
    this.telefonoCuidador = data.telefonoCuidador || '';
    this.tarifaPorHora = data.tarifaPorHora || null;
    this.calificacionPromedio = data.calificacionPromedio || null;
  }
}

// Modelo para crear solicitud
export class SolicitudRequest {
  constructor(data = {}) {
    this.clienteID = data.clienteID || null;
    this.cuidadorID = data.cuidadorID || null;
    this.tipoServicio = data.tipoServicio || '';
    this.descripcion = data.descripcion || '';
    this.fechaHoraInicio = data.fechaHoraInicio || '';
    this.duracionHoras = data.duracionHoras || 0;
    this.ubicacion = data.ubicacion || '';
  }
}

// Modelo para cambiar estado
export class SolicitudEstadoRequest {
  constructor(estado = '') {
    this.estado = estado;
  }
}

// Modelo para asignar cuidador
export class AsignarCuidadorRequest {
  constructor(cuidadorID = 0) {
    this.cuidadorID = cuidadorID;
  }
}

// Modelo de usuario desde Auth
export class UsuarioAuthResponseDto {
  constructor(data = {}) {
    this.id = data.id || 0;
    this.nombre = data.nombre || '';
    this.email = data.email || '';
    this.telefono = data.telefono || '';
  }
}

// Modelo de información extra del cuidador
export class CuidadorExtraResponseDto {
  constructor(data = {}) {
    this.cuidadorID = data.cuidadorID || 0;
    this.biografia = data.biografia || '';
    this.tarifaPorHora = data.tarifaPorHora || 0;
    this.calificacionPromedio = data.calificacionPromedio || 0;
  }
}

// Helper functions
export const createSolicitudRequest = (data) => new SolicitudRequest(data);
export const createSolicitudEstadoRequest = (estado) => new SolicitudEstadoRequest(estado);
export const createAsignarCuidadorRequest = (cuidadorID) => new AsignarCuidadorRequest(cuidadorID);