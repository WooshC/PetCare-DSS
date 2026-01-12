// models/Cuidador.js
export class CuidadorRequest {
  constructor(
    documentoIdentidad = '',
    telefonoEmergencia = '',
    biografia = '',
    experiencia = '',
    tarifaPorHora = 0,
    horarioAtencion = ''
  ) {
    this.documentoIdentidad = documentoIdentidad;
    this.telefonoEmergencia = telefonoEmergencia;
    this.biografia = biografia;
    this.experiencia = experiencia;
    this.tarifaPorHora = tarifaPorHora;
    this.horarioAtencion = horarioAtencion;
  }
}

// models/Cuidador.js
export class CuidadorResponse {
  constructor(data = {}) {
    this.cuidadorID = data.cuidadorID || 0;
    this.usuarioID = data.usuarioID || 0;
    
    // Información del usuario (ahora vendrá poblada)
    this.nombreUsuario = data.nombreUsuario || '';
    this.emailUsuario = data.emailUsuario || '';
    this.telefonoUsuario = data.telefonoUsuario || '';
    
    // Información específica del cuidador
    this.documentoIdentidad = data.documentoIdentidad || '';
    this.telefonoEmergencia = data.telefonoEmergencia || '';
    this.biografia = data.biografia || '';
    this.experiencia = data.experiencia || '';
    this.horarioAtencion = data.horarioAtencion || '';
    this.tarifaPorHora = data.tarifaPorHora || 0;
    this.calificacionPromedio = data.calificacionPromedio || 0;
    this.documentoVerificado = data.documentoVerificado || false;
    this.fechaVerificacion = data.fechaVerificacion || null;
    this.estado = data.estado || 'Activo';
    this.fechaCreacion = data.fechaCreacion || null;
    this.fechaActualizacion = data.fechaActualizacion || null;
  }

}