// src/components/common/PerfilUsuario.jsx
import React from 'react';
import { Mail, Phone, Shield, Star, User, Heart, PawPrint, BadgeCheck, Clock } from 'lucide-react';

const PerfilUsuario = ({
  usuario,
  tipo = 'cuidador', // 'cuidador' o 'cliente'
  showStats = false,
  stats = {},
  className = ''
}) => {
  const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  };

  const renderStarRating = (rating) => {
    if (!rating || rating === 0) return null;

    return (
      <div className="flex space-x-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-200'
              }`}
          />
        ))}
      </div>
    );
  };

  const user = getCurrentUser();

  // Priorizar datos del usuario que vienen de la API (cuidador.nombreUsuario, cuidador.emailUsuario)
  // Si no están disponibles, usar los de localStorage
  const userData = {
    nombreUsuario: usuario?.nombreUsuario || usuario?.name || user.name || '',
    email: usuario?.emailUsuario || usuario?.email || user.email || '',
    phoneNumber: usuario?.telefonoUsuario || user.phoneNumber || '',
    ...usuario
  };

  const getTipoUsuario = () => {
    switch (tipo) {
      case 'cuidador':
        return {
          color: 'brand', // Blue/Brand
          textColor: 'text-brand-600',
          bgColor: 'bg-brand-50',
          borderColor: 'border-brand-100',
          texto: 'Cuidador',
          icono: <PawPrint className="w-8 h-8 text-brand-500" />
        };
      case 'cliente':
        return {
          color: 'emerald',
          textColor: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-100',
          texto: 'Cliente',
          icono: <Heart className="w-8 h-8 text-emerald-500" />
        };
      default:
        return {
          color: 'slate',
          textColor: 'text-slate-600',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200',
          texto: 'Usuario',
          icono: <User className="w-8 h-8 text-slate-500" />
        };
    }
  };

  const config = getTipoUsuario();

  return (
    <div className={`bg-white rounded-[3rem] shadow-deep border border-slate-50 p-8 text-center relative overflow-hidden group ${className}`}>
      {/* Decorative background element */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${config.bgColor} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>

      {/* Avatar Container */}
      <div className="relative mb-6">
        <div className={`w-24 h-24 ${config.bgColor} rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm border-2 ${config.borderColor} transform group-hover:rotate-6 transition-transform duration-500`}>
          {config.icono}
        </div>
        {userData.documentoVerificado && (
          <div className="absolute bottom-0 right-[calc(50%-2.5rem)] bg-white p-1 rounded-full shadow-md">
            <BadgeCheck className={`w-6 h-6 ${config.textColor} fill-current`} />
          </div>
        )}
      </div>

      {/* User Branding */}
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
          {userData.nombreUsuario || user.name || config.texto}
        </h3>

        <div className="flex justify-center mb-6">
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
            <User className="h-3 w-3 mr-2" />
            {config.texto}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Email */}
        <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:border-brand-200 transition-all">
          <Mail className="h-4 w-4 mr-3 text-slate-400 group-hover/item:text-brand-500 transition-colors" />
          <span className="text-slate-600 text-sm font-bold">{userData.emailUsuario || userData.email || user.email || 'No especificado'}</span>
        </div>

        {/* Teléfono Principal */}
        {(userData.phoneNumber || user.phoneNumber) && (
          <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:border-brand-200 transition-all">
            <Phone className="h-4 w-4 mr-3 text-slate-400 group-hover/item:text-brand-500 transition-colors" />
            <span className="text-slate-600 text-sm font-bold">{userData.phoneNumber || user.phoneNumber || 'No especificado'}</span>
          </div>
        )}

        {/* Correo institucional */}
        <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {user.email ? '📧 Correo institucional' : ''}
        </div>

        {/* Stats Section if enabled */}
        {showStats && (
          <div className="grid grid-cols-2 gap-3 py-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asignadas</p>
              <p className="text-xl font-black text-slate-800">{stats.asignadas || 0}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activas</p>
              <p className="text-xl font-black text-slate-800">{stats.activas || stats.aceptadas || 0}</p>
            </div>
          </div>
        )}

        {/* Rating */}
        {tipo === 'cuidador' && userData.calificacionPromedio > 0 && (
          <div className="py-2">
            {renderStarRating(userData.calificacionPromedio)}
            <p className="text-xs font-black text-slate-400 uppercase mt-2">{userData.calificacionPromedio?.toFixed(1)} Puntuación Media</p>
          </div>
        )}

        {/* Price Tag */}
        {tipo === 'cuidador' && userData.tarifaPorHora && (
          <div className="bg-emerald-50 p-4 rounded-[2rem] border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Tarifa General</p>
            <p className="text-2xl font-black text-emerald-700">${userData.tarifaPorHora}<span className="text-sm">/hr</span></p>
          </div>
        )}

        {/* Phones */}
        {userData.telefonoEmergencia && (
          <div className="flex items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:border-amber-200 transition-all">
            <Shield className="h-4 w-4 mr-3 text-amber-400 group-hover/item:text-amber-600 transition-colors" />
            <div className="text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Teléfono de Emergencia</span>
              <span className="text-slate-600 text-sm font-bold">{userData.telefonoEmergencia}</span>
            </div>
          </div>
        )}
      </div>

      {userData.documentoVerificado === false && (
        <div className="mt-8">
          <span className="inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="h-3 w-3 mr-2" />
            Validación en proceso
          </span>
        </div>
      )}
    </div>
  );
};

export default PerfilUsuario;