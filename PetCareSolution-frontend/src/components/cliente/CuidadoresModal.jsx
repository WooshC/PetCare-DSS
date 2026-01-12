// components/cliente/CuidadoresModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Search, MapPin, DollarSign, Award, ShieldCheck, Heart } from 'lucide-react';
import { useCuidadores } from '../../hooks/useCuidadores';

const CuidadoresModal = ({ isOpen, onClose, onAsignarCuidador, solicitudId, loading: assigningLoading }) => {
  const { cuidadores, loading: loadingCuidadores, error } = useCuidadores();
  const [filtroCalificacion, setFiltroCalificacion] = useState(0);
  const [filtroVerificados, setFiltroVerificados] = useState(false);
  const [filtroTarifaMax, setFiltroTarifaMax] = useState(100);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFiltroCalificacion(0);
      setFiltroVerificados(false);
      setFiltroTarifaMax(100);
      setBusqueda('');
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const cuidadoresFiltrados = cuidadores.filter(cuidador => {
    if (filtroCalificacion > 0 && (cuidador.calificacionPromedio || 0) < filtroCalificacion) return false;
    if (filtroVerificados && !cuidador.documentoVerificado) return false;
    if (cuidador.tarifaPorHora > filtroTarifaMax) return false;
    if (busqueda && !cuidador.nombreUsuario?.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const renderStars = (rating) => {
    const r = Math.round(rating || 0);
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={`w-4 h-4 ${s <= r ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-slate-50 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header con Barra de Búsqueda */}
        <div className="bg-white px-8 py-6 md:px-12 md:py-8 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Elige el cuidador ideal</h2>
              <p className="text-slate-500 font-medium mt-1">
                {cuidadoresFiltrados.length} expertos disponibles ahora
              </p>
            </div>

            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
              />
            </div>

            <button onClick={onClose} className="hidden md:flex p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <X className="w-8 h-8 text-slate-400" />
            </button>
          </div>

          {/* Filtros Crills */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <select
              value={filtroCalificacion}
              onChange={e => setFiltroCalificacion(Number(e.target.value))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 focus:outline-none hover:bg-slate-50"
            >
              <option value={0}>Calificación: Todas</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
            </select>
            <select
              value={filtroTarifaMax}
              onChange={e => setFiltroTarifaMax(Number(e.target.value))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 focus:outline-none hover:bg-slate-50"
            >
              <option value={100}>Tarifa: Cualquiera</option>
              <option value={20}>Hasta $20/h</option>
              <option value={30}>Hasta $30/h</option>
            </select>
            <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-full cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={filtroVerificados}
                onChange={e => setFiltroVerificados(e.target.checked)}
                className="rounded-full text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-600">Verificados</span>
            </label>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 md:p-12">
          {loadingCuidadores ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Heart className="w-12 h-12 text-slate-200 mb-4 animate-bounce" />
              <p className="text-slate-400 font-bold">Buscando cuidadores...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-8 rounded-[2rem] text-center border-2 border-red-100">
              <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-800 font-bold">{error}</p>
            </div>
          ) : cuidadoresFiltrados.length === 0 ? (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800">No encontramos coincidencias</h3>
              <p className="text-slate-500 mt-2 font-medium">Intenta ajustar tus filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cuidadoresFiltrados.map((c) => (
                <div key={c.cuidadorID} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-500/30 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.1)] transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {c.nombreUsuario?.charAt(0) || '👤'}
                    </div>
                    {c.documentoVerificado && (
                      <div className="flex items-center text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full shadow-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verificado
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {c.nombreUsuario || 'Cuidador'}
                  </h3>

                  <div className="flex items-center justify-between mt-4 mb-6">
                    <div className="flex items-center space-x-2">
                      {renderStars(c.calificacionPromedio)}
                      <span className="text-sm font-bold text-slate-400">({c.calificacionPromedio?.toFixed(1) || '0.0'})</span>
                    </div>
                    <div className="text-indigo-600 font-black text-lg">
                      ${c.tarifaPorHora}<span className="text-sm text-slate-400">/hr</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-sm font-bold text-slate-500">
                      <Award className="w-4 h-4 mr-2 text-blue-500" />
                      {c.experiencia || 'Nueva incorporación'}
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 italic">
                      "{c.biografia || 'Sin descripción disponible aún...'}"
                    </p>
                  </div>

                  <button
                    onClick={() => onAsignarCuidador(c.cuidadorID)}
                    disabled={assigningLoading}
                    className="w-full py-4 bg-slate-900 group-hover:bg-blue-600 text-white rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center shadow-lg shadow-slate-100 group-hover:shadow-blue-200"
                  >
                    {assigningLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Elegir experto"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer simple */}
        <div className="bg-white px-12 py-6 border-t border-slate-100 flex justify-between items-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">PetCare Seguros & Confianza ✨</p>
          <button onClick={onClose} className="md:hidden text-blue-600 font-bold">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CuidadoresModal;