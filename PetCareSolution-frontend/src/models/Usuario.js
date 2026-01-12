// models/Usuario.js
export class Usuario {
  constructor(data = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phoneNumber = data.phoneNumber || '';
    this.role = data.role || '';
    this.rawRole = data.rawRole || '';
    this.isAuthenticated = !!data.id;
  }
}