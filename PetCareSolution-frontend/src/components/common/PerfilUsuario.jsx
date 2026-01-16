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

  const userData = {
    nombreUsuario: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
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
          {user.name || userData.nombreUsuario || config.texto}
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
          <span className="text-slate-600 text-sm font-bold">{user.email || userData.email || 'No disponible'}</span>
        </div>

        {/* Stats Section if enabled */}
        {showStats && (
          <div className="grid grid-cols-2 gap-3 py-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Finalizados</p>
              <p className="text-xl font-black text-slate-800">{stats.finalizadas || 0}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-black text-slate-800">{stats.total || 0}</p>
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
        {(user.phoneNumber || userData.telefonoEmergencia) && (
          <div className="flex flex-col space-y-2 pt-2">
            {user.phoneNumber && (
              <div className="flex items-center justify-center text-slate-500 text-sm font-medium">
                <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                {user.phoneNumber}
              </div>
            )}
            {userData.telefonoEmergencia && (
              <div className="flex items-center justify-center text-slate-400 text-xs font-medium italic">
                <Shield className="h-3 w-3 mr-2" />
                Emergencia: {userData.telefonoEmergencia}
              </div>
            )}
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