// src/components/cuidador/HistorialSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PerfilUsuario from '../common/PerfilUsuario';
import Pagination from '../ui/Pagination';
import { cuidadorSolicitudService } from '../../services/api/cuidadorSolicitudAPI';
import {
  ClipboardList, CheckCircle2, XCircle, Search,
  Filter, Calendar, MapPin, Tag, Clock, FileText, User
} from 'lucide-react';

const HistorialSection = ({ cuidador }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const loadHistorial = async () => {
      try {
        setLoading(true);
        const data = await cuidadorSolicitudService.getMisSolicitudes();
        // Filtrar solo terminadas, canceladas o rechazadas
        const historial = data.filter(s =>
          ['Finalizada', 'Cancelada', 'Rechazada'].includes(s.estado)
        );
        setSolicitudes(historial);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHistorial();
  }, []);

  const paginatedHistorial = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return solicitudes.slice(start, start + ITEMS_PER_PAGE);
  }, [solicitudes, currentPage]);

  const totalPages = Math.ceil(solicitudes.length / ITEMS_PER_PAGE);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return 'N/A'; }
  };

  const getStatusBadge = (estado) => {
    const styles = {
      'Finalizada': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'Cancelada': 'bg-rose-50 text-rose-600 border-rose-100',
      'Rechazada': 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return styles[estado] || 'bg-slate-50 text-slate-400 border-slate-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-slate-600 font-bold">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Profile Card */}
        <div className="lg:col-span-1">
          <PerfilUsuario
            usuario={cuidador}
            tipo="cuidador"
            showStats={true}
            stats={{
              finalizadas: solicitudes.filter(s => s.estado === 'Finalizada').length,
              total: solicitudes.length
            }}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] shadow-deep p-8 border border-slate-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                  Historial de Servicios
                </h2>
                <p className="text-slate-500 font-medium mt-1">Registro completo de tus actividades pasadas</p>
              </div>
              <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
                {solicitudes.length} Registros
              </div>
            </div>

            {solicitudes.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-7xl mb-6"><ClipboardList className="w-20 h-20 mx-auto text-slate-300 opacity-50" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Historial vacío</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  Aún no tienes registros de servicios finalizados o procesados.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedHistorial.map((s) => (
                  <div key={s.solicitudID} className="bg-white border-2 border-slate-50 rounded-[2rem] p-6 hover:border-slate-100 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 group-hover:scale-150 transition-transform duration-700">
                      <ClipboardList className="w-24 h-24" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{s.nombreCliente}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{s.solicitudID}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusBadge(s.estado)}`}>
                        {s.estado}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-4 h-4 text-emerald-400 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Fecha</p>
                          <p className="text-xs font-bold text-slate-600">{formatDate(s.fechaHoraInicio)}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Tag className="w-4 h-4 text-brand-400 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Servicio</p>
                          <p className="text-xs font-bold text-slate-600">{s.tipoServicio}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded-full mt-0.5 ${s.modoPago === 'Fisico' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center`}>$</div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Pago</p>
                          <p className="text-xs font-bold text-slate-600">
                            {s.modoPago || 'PayPal'}
                            {s.isPaid ? <span className="text-green-600 ml-1">(Pagado)</span> : <span className="text-amber-500 ml-1">(Pendiente)</span>}
                          </p>
                        </div>
                      </div>
                      {/* Calificación (si existe, idealmente deberíamos traerla, por ahora mostramos si está calificado) */}
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 mt-0.5 ${s.isRated ? 'text-yellow-400' : 'text-slate-300'}`}>⭐</div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Calificación</p>
                          <p className="text-xs font-bold text-slate-600">
                            {s.isRated ? "¡Calificado!" : "Sin calificar"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-start space-x-3">
                      <FileText className="w-3.5 h-3.5 text-slate-400 mt-1" />
                      <p className="text-slate-500 text-xs italic">"{s.descripcion}"</p>
                    </div>

                    {/* Sección opcional para mostrar comentario si tuviéramos acceso directo al rating aquí. 
                        Por ahora, requeriría hacer requests adicionales por cada item, lo cual no es óptimo sin cambiar el backend.
                        Dejaremos la indicación visual de "Calificado" que ya es un avance. */}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialSection;