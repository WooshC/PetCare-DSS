// src/components/cliente/HistorialSection.jsx
import React, { useState, useMemo } from 'react';
import { useClienteSolicitudes } from '../../hooks/useClienteSolicitudes';
import SolicitudCard from './SolicitudCard';
import Pagination from '../ui/Pagination';
import CalificarModal from './CalificarModal';
import ActionModal from '../common/ActionModal';

const HistorialSection = () => {
  const { solicitudes, loading, error } = useClienteSolicitudes();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Estado para el modal de calificación
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [selectedSolicitudForRating, setSelectedSolicitudForRating] = useState(null);

  // Estado para el ActionModal de éxito
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  const historialSolicitudes = useMemo(() => {
    return solicitudes.filter(s =>
      s.estado === 'Finalizada' || s.estado === 'Cancelada'
    );
  }, [solicitudes]);

  const paginatedHistorial = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return historialSolicitudes.slice(start, start + ITEMS_PER_PAGE);
  }, [historialSolicitudes, currentPage]);

  const totalPages = Math.ceil(historialSolicitudes.length / ITEMS_PER_PAGE);

  const handleOpenRating = (solicitud) => {
    setSelectedSolicitudForRating(solicitud);
    setShowCalificarModal(true);
  };

  const handleRatingSuccess = () => {
    setShowCalificarModal(false);
    setSelectedSolicitudForRating(null);
    setModal({
      show: true,
      type: 'success',
      title: '¡Gracias por tu reseña!',
      message: 'Tu calificación ha sido enviada exitosamente. ¡Apreciamos mucho tu feedback!'
    });
  };

  if (loading && solicitudes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-slate-600 font-bold">Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-deep p-8 border border-slate-50 animate-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Historial de Servicios
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Revisa tus servicios pasados y cancelados
          </p>
        </div>
        <div className="self-start md:self-center bg-slate-900 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
          {historialSolicitudes.length} Registros
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-6">
          <p className="text-red-600 font-bold flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </p>
        </div>
      ) : historialSolicitudes.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="text-7xl mb-6">📊</div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">
            Sin actividad previa
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            Aún no tienes servicios finalizados o cancelados en tu historial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {paginatedHistorial.map((solicitud) => (
            <div key={solicitud.solicitudID} className="hover-lift">
              <SolicitudCard
                solicitud={solicitud}
                actionLoading={false}
                onCalificar={handleOpenRating}
                showExpandControl={false}
              />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modales */}
      {showCalificarModal && selectedSolicitudForRating && (
        <CalificarModal
          solicitud={selectedSolicitudForRating}
          onClose={() => { setShowCalificarModal(false); setSelectedSolicitudForRating(null); }}
          onSuccess={handleRatingSuccess}
        />
      )}

      <ActionModal
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        confirmText="Entendido"
      />

      <div className="mt-12 p-8 bg-gradient-to-br from-brand-50/50 to-slate-50 rounded-[2rem] border border-brand-100/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <div className="text-6xl font-black text-brand-500">TIP</div>
        </div>
        <h4 className="text-lg font-black text-brand-800 flex items-center mb-3">
          <span className="mr-2">💡</span> Nota informativa
        </h4>
        <p className="text-brand-700/80 text-sm font-medium leading-relaxed max-w-2xl relative z-10">
          Las solicitudes finalizadas aparecen aquí para tu referencia. Si el servicio fue excelente, ¡no olvides calificarlo para ayudar a otros usuarios!
        </p>
      </div>
    </div>
  );
};

export default HistorialSection;