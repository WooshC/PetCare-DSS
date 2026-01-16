// src/components/cuidador/solicitudes/SolicitudActivaCard.jsx
import React from 'react';
import {
  Calendar, Clock, MapPin, User, Mail, Phone,
  ChevronDown, ChevronUp, CheckCircle2,
  ShieldCheck, Tag, Play, Check, AlertCircle, Info, FileText
} from 'lucide-react';

const SolicitudActivaCard = ({
  solicitud,
  expandedCard,
  actionLoading,
  toggleExpanded,
  handleIniciar,
  handleFinalizar,
  formatDate
}) => {

  const isExpanded = expandedCard === solicitud.solicitudID;
  const isActionLoading = actionLoading === solicitud.solicitudID;

  const getStatusConfig = (estado) => {
    const configs = {
      'Aceptada': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      'En Progreso': {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      'Fuera de Tiempo': {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        icon: <AlertCircle className="w-4 h-4" />,
      }
    };
    return configs[estado] || configs['Aceptada'];
  };

  const status = getStatusConfig(solicitud.estado);
  const puedeIniciar = solicitud.estado === 'Aceptada';
  const puedeFinalizar = solicitud.estado === 'En Progreso';

  return (
    <div className={`bg-white rounded-[2rem] border-2 transition-all duration-300 ${isExpanded ? 'border-slate-200 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}`}>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl ${status.bg} flex items-center justify-center ${status.text}`}>
              {status.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                  {solicitud.estado}
                </span>
                <span className="text-slate-300 text-xs font-medium">#{solicitud.solicitudID}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{solicitud.nombreCliente || 'Cliente'}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {puedeIniciar && (
                <button
                  onClick={() => handleIniciar(solicitud.solicitudID)}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center"
                >
                  {isActionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Iniciar Servicio
                </button>
              )}
              {puedeFinalizar && (
                <button
                  onClick={() => handleFinalizar(solicitud.solicitudID)}
                  disabled={isActionLoading}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center"
                >
                  {isActionLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Finalizar
                </button>
              )}
            </div>
            <button
              onClick={() => toggleExpanded(isExpanded ? null : solicitud.solicitudID)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Main Content Layout - Description on Left, Info Grid on Right */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Description (Left per request) - Always visible */}
          <div className="lg:w-1/3">
            <div className="h-full p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 relative group hover:bg-white hover:border-brand-200 transition-all duration-300">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4 text-brand-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nota del Cliente</span>
              </div>
              <p className="text-slate-600 text-sm italic leading-relaxed">
                "{solicitud.descripcion}"
              </p>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <FileText className="w-12 h-12" />
              </div>
            </div>
          </div>

          {/* Info Grid (Right) */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-50 bg-white flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ubicación</p>
                <p className="text-sm font-bold text-slate-700">{solicitud.ubicacion}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-50 bg-white flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Fecha/Hora</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(solicitud.fechaHoraInicio)}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-50 bg-white flex items-start space-x-3">
              <Clock className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Duración</p>
                <p className="text-sm font-bold text-slate-700">{solicitud.duracionHoras} horas</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-50 bg-white flex items-start space-x-3">
              <Tag className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Servicio</p>
                <p className="text-sm font-bold text-slate-700">{solicitud.tipoServicio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline - Simplified */}
        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-tight tracking-wider">Creada: {formatDate(solicitud.fechaCreacion)}</span>
          </div>
          {solicitud.fechaAceptacion && (
            <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-tight tracking-wider">Aceptada: {formatDate(solicitud.fechaAceptacion)}</span>
            </div>
          )}
          {solicitud.fechaInicio && (
            <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[9px] font-black uppercase text-indigo-600 tracking-tight tracking-wider">Iniciada: {formatDate(solicitud.fechaInicio)}</span>
            </div>
          )}
        </div>

        {/* Expanded Content (Contact Details) */}
        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center mb-6">
              <Info className="w-4 h-4 mr-2 text-brand-500" />
              Información de contacto directa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-4 hover:border-brand-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Email Cliente</p>
                  <p className="text-sm font-bold text-slate-700">{solicitud.emailCliente || 'No disponible'}</p>
                </div>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-4 hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Teléfono Cliente</p>
                  <p className="text-sm font-bold text-slate-700">{solicitud.telefonoCliente || 'No disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudActivaCard;