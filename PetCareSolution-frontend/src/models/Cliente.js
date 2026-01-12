// Modelos para el cliente en el frontend
export class ClienteRequest {
  constructor(documentoIdentidad = '', telefonoEmergencia = '') {
    this.documentoIdentidad = documentoIdentidad;
    this.telefonoEmergencia = telefonoEmergencia;
  }
}

export class ClienteResponse {
  constructor(data = {}) {
    this.clienteID = data.clienteID || 0;
    this.usuarioID = data.usuarioID || 0;
    this.documentoIdentidad = data.documentoIdentidad || '';
    this.telefonoEmergencia = data.telefonoEmergencia || '';
    this.documentoVerificado = data.documentoVerificado || false;
    this.fechaVerificacion = data.fechaVerificacion || null;
    this.estado = data.estado || 'Activo';
    this.fechaCreacion = data.fechaCreacion || null;
    this.fechaActualizacion = data.fechaActualizacion || null;
  }
}