// src/components/cliente/ClientePerfil.jsx
import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/api/clientAPI';
import { Edit3, Save, X, User, Phone, Shield, Calendar, Mail, BadgeCheck, Clock, FileText, Layout, Heart } from 'lucide-react';

const ClientePerfil = ({ onLogout, onEditProfile }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClienteProfile();
  }, [token]);

  const fetchClienteProfile = async () => {
    try {
      const response = await clientService.getProfile(token);
      if (response.success && response.data) {
        setCliente(response.data);
        setEditData(response.data);
        setError(null);
      } else {
        setError(response.error || 'No se encontró perfil de cliente');
        setCliente(null);
      }
    } catch (error) {
      setError(error.message || 'Error al cargar el perfil');
      setCliente(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = () => {
    setEditing(true);
    setEditData(cliente || {});
    setEditErrors({});
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditData(cliente || {});
    setEditErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!editData.documentoIdentidad?.trim()) {
      errors.documentoIdentidad = 'El documento de identidad es requerido';
    } else if (!/^\d{10,13}$/.test(editData.documentoIdentidad)) {
      errors.documentoIdentidad = 'Documento de identidad inválido (10-13 dígitos)';
    }
    if (editData.telefonoEmergencia && !/^\d{7,15}$/.test(editData.telefonoEmergencia)) {
      errors.telefonoEmergencia = 'Teléfono inválido';
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      const updateData = {
        documentoIdentidad: editData.documentoIdentidad || '',
        telefonoEmergencia: editData.telefonoEmergencia || ''
      };
      const response = await clientService.updateProfile(updateData, token);
      if (response.success) {
        setCliente(prev => ({ ...prev, ...updateData }));
        setEditing(false);
        setError({ type: 'success', message: 'Perfil actualizado exitosamente' });
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.error || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setError({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      const profileData = {
        documentoIdentidad: editData.documentoIdentidad || '',
        telefonoEmergencia: editData.telefonoEmergencia || ''
      };
      const response = await clientService.createProfile(profileData, token);
      if (response.success) {
        setCliente(response.data);
        setEditing(false);
        setError({ type: 'success', message: 'Perfil creado exitosamente' });
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.error || 'Error al crear el perfil');
      }
    } catch (error) {
      setError({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPhone = (phone) => phone || 'No especificado';

  // Helper component for Info Boxes
  const InfoBox = ({ label, value, icon: Icon, subtext, children }) => (
    <div className="p-6 border border-slate-50 hover:bg-slate-50 transition-all group">
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      {children || <p className="text-sm font-bold text-slate-700">{value || 'No especificado'}</p>}
      {subtext && <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-slate-600 font-bold tracking-tight">Cargando perfil...</span>
      </div>
    );
  }

  // Error State / Create Profile
  if (error && !cliente && typeof error === 'string') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-[3rem] p-12 text-center shadow-xl shadow-amber-100/50 mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Bienvenido a PetCare</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Necesitamos completar unos últimos detalles para que puedas empezar a pedir servicios para tus mascotas.</p>

          <div className="max-w-md mx-auto space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Documento de Identidad</label>
              <input
                type="text"
                value={editData.documentoIdentidad || ''}
                onChange={(e) => handleEditChange('documentoIdentidad', e.target.value)}
                className={`w-full p-4 bg-white border-2 rounded-2xl text-sm font-bold transition-all ${editErrors.documentoIdentidad ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'
                  }`}
                placeholder="Cédula o RUC"
              />
              {editErrors.documentoIdentidad && <p className="text-red-500 text-[10px] font-black uppercase px-2">{editErrors.documentoIdentidad}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Teléfono de Emergencia</label>
              <input
                type="text"
                value={editData.telefonoEmergencia || ''}
                onChange={(e) => handleEditChange('telefonoEmergencia', e.target.value)}
                className={`w-full p-4 bg-white border-2 rounded-2xl text-sm font-bold transition-all ${editErrors.telefonoEmergencia ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'
                  }`}
                placeholder="Ej: 0987654321"
              />
              {editErrors.telefonoEmergencia && <p className="text-red-500 text-[10px] font-black uppercase px-2">{editErrors.telefonoEmergencia}</p>}
            </div>

            <button
              onClick={handleCreateProfile}
              disabled={saving}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Completar mi Perfil'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in max-w-6xl mx-auto space-y-8">
      {/* Premium Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-deep p-8 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] -rotate-12 pointer-events-none">
          <User className="w-48 h-48" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center border-2 border-emerald-100 shadow-sm">
              <Heart className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">¡Hola, {user.name}!</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-slate-400 text-sm font-medium">Gestiona tu información personal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Estado: Activo</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            {!editing ? (
              <button
                onClick={handleEditStart}
                className="flex items-center space-x-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Edit3 className="h-4 w-4" />
                <span>Editar Perfil</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? '...' : 'Guardar'}</span>
                </button>
                <button
                  onClick={handleEditCancel}
                  disabled={saving}
                  className="flex items-center space-x-3 bg-slate-100 text-slate-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {error && typeof error === 'object' && (
          <div className={`mt-8 p-4 rounded-2xl border ${error.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
            } animate-in slide-in-from-top-2`}>
            <p className="text-xs font-bold text-center uppercase tracking-widest">{error.message}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-deep overflow-hidden border border-slate-50">
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Información de Perfil</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-slate-50">
              <div className="p-6 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documento de Identidad</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={editData.documentoIdentidad || ''}
                    onChange={(e) => handleEditChange('documentoIdentidad', e.target.value)}
                    className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold transition-all ${editErrors.documentoIdentidad ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'
                      }`}
                    placeholder="Cédula"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{cliente?.documentoIdentidad || 'No especificado'}</p>
                )}
                {editErrors.documentoIdentidad && <p className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{editErrors.documentoIdentidad}</p>}
              </div>

              <div className="p-6 group hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teléfono Emergencia</span>
                </div>
                {editing ? (
                  <input
                    type="text"
                    value={editData.telefonoEmergencia || ''}
                    onChange={(e) => handleEditChange('telefonoEmergencia', e.target.value)}
                    className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold transition-all ${editErrors.telefonoEmergencia ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-emerald-500'
                      }`}
                    placeholder="Teléfono"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{cliente?.telefonoEmergencia || 'No especificado'}</p>
                )}
                {editErrors.telefonoEmergencia && <p className="text-red-500 text-[10px] font-black uppercase mt-1 px-1">{editErrors.telefonoEmergencia}</p>}
              </div>

              <InfoBox label="Estatus de Cuenta" icon={Shield}>
                <div className="mt-1">
                  {cliente?.documentoVerificado ? (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <BadgeCheck className="h-3.5 w-3.5 mr-2" />
                      Perfil Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      Verificación Pendiente
                    </span>
                  )}
                </div>
              </InfoBox>

              <InfoBox label="Miembro desde" value={formatDate(cliente?.fechaCreacion)} icon={Calendar} />
              <InfoBox label="Última Actividad" value={formatDate(cliente?.fechaActualizacion)} icon={Clock} />
            </div>
          </div>
        </div>

        {/* Account Details Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-deep p-8 border border-slate-50">
            <div className="flex items-center space-x-3 mb-8">
              <Mail className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Información de Inicio</h3>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Nombre Completo</p>
                <p className="font-black text-slate-700">{user.name}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Email Principal</p>
                <p className="font-black text-slate-700">{user.email}</p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Teléfono Principal</p>
                <p className="font-black text-slate-700">{formatPhone(user.phoneNumber)}</p>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estado</span>
                  <span className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse shadow-sm shadow-emerald-500"></span>
                </div>
                <p className="text-xs font-bold text-slate-500">Tu cuenta personal está lista y protegida.</p>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          {!cliente?.documentoVerificado && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] p-8 border border-amber-100 relative overflow-hidden group">
              <div className="absolute -bottom-8 -right-8 opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                <Shield className="w-32 h-32" />
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight mb-2">Acción Requerida</h4>
                  <p className="text-xs font-bold text-amber-700/70 leading-relaxed italic">
                    Tu documento de identidad está en proceso de revisión manual por nuestro equipo de seguridad. Recibirás un correo al completarse.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientePerfil;