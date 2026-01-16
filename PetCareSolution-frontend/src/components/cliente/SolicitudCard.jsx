// components/cliente/SolicitudCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, User, Mail, Phone,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Clock3, XCircle, Info, Star, ShieldCheck, CreditCard, DollarSign
} from 'lucide-react';

const SolicitudCard = ({ solicitud, onAsignarCuidador, onCancelarSolicitud, onCalificar, actionLoading, showExpandControl = true }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const getStatusConfig = (estado) => {
    const configs = {
      'Pendiente': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <Clock3 className="w-4 h-4" />,
        dot: 'bg-amber-400'
      },
      'Asignada': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <User className="w-4 h-4" />,
        dot: 'bg-blue-400'
      },
      'Aceptada': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        dot: 'bg-emerald-400'
      },
      'En Progreso': {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: <ShieldCheck className="w-4 h-4" />,
        dot: 'bg-indigo-400'
      },
      'Finalizada': {
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: <CheckCircle2 className="w-4 h-4" />,
        dot: 'bg-slate-300'
      },
      'Cancelada': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircle className="w-4 h-4" />,
        dot: 'bg-red-400'
      },
      'Rechazada': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <AlertCircle className="w-4 h-4" />,
        dot: 'bg-red-400'
      }
    };
    return configs[estado] || configs['Pendiente'];
  };

  const status = getStatusConfig(solicitud.estado);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const canCancel = () => ['Pendiente', 'Asignada', 'Aceptada'].includes(solicitud.estado);
  const canAssign = () => solicitud.estado === 'Pendiente';

  return (
    <div className={`bg-white rounded-[2rem] border-2 transition-all duration-300 ${expanded ? 'border-slate-200 shadow-xl' : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'}`}>

      {/* Header Area */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-2xl ${status.bg} flex items-center justify-center ${status.text} transition-transform group-hover:scale-110`}>
              {status.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                  {solicitud.estado}
                </span>
                <span className="text-slate-300 text-xs font-medium">#{solicitud.solicitudID}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{solicitud.tipoServicio}</h3>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {canAssign() && (
              <button
                onClick={() => onAsignarCuidador(solicitud.solicitudID)}
                disabled={actionLoading === solicitud.solicitudID}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-100 disabled:bg-slate-200"
              >
                {actionLoading === solicitud.solicitudID ? "Cargando..." : "Elegir Cuidador"}
              </button>
            )}

            {solicitud.estado === 'Finalizada' && (
              <>
                <button
                  onClick={() => navigate(`/cliente/pago/${solicitud.solicitudID}`)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-emerald-200 flex items-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar
                </button>
                <button
                  onClick={() => onCalificar(solicitud)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-purple-100"
                >
                  Calificar
                </button>
              </>
            )}

            {showExpandControl && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
              >
                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Info Grid (Visible always) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ubicación</p>
              <p className="text-sm font-bold text-slate-700 line-clamp-1">{solicitud.ubicacion}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Fecha/Hora</p>
              <p className="text-sm font-bold text-slate-700">{formatDate(solicitud.fechaHoraInicio)}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Duración</p>
              <p className="text-sm font-bold text-slate-700">{solicitud.duracionHoras} horas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Cuidador</p>
              <p className="text-sm font-bold text-slate-700">{solicitud.nombreCuidador || 'Sin asignar'}</p>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <p className="text-slate-600 text-sm italic leading-relaxed">"{solicitud.descripcion}"</p>
        </div>

        {/* Expanded Content */}
        {showExpandControl && expanded && (
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-top-4">

            {/* Detalles de contacto */}
            <div className="flex-1 space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center">
                <Info className="w-4 h-4 mr-2 text-blue-500" />
                Información de contacto
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Email del Cuidador</p>
                    <p className="text-sm font-bold text-slate-700">{solicitud.emailCuidador || 'No disponible'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Teléfono del Cuidador</p>
                    <p className="text-sm font-bold text-slate-700">{solicitud.telefonoCuidador || 'No disponible'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline simple */}
            <div className="w-full md:w-64 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Cronología</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Creado</p>
                    <p className="text-xs font-bold text-slate-700">{formatDate(solicitud.fechaCreacion)}</p>
                  </div>
                </div>
                {solicitud.fechaAceptacion && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Aceptado</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(solicitud.fechaAceptacion)}</p>
                    </div>
                  </div>
                )}
                {solicitud.fechaFinalizacion && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Finalizado</p>
                      <p className="text-xs font-bold text-slate-700">{formatDate(solicitud.fechaFinalizacion)}</p>
                    </div>
                  </div>
                )}
              </div>

              {canCancel() && (
                <button
                  onClick={() => onCancelarSolicitud(solicitud.solicitudID)}
                  className="w-full mt-6 py-3 border-2 border-red-50 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancelar Solicitud
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudCard;