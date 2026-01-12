// src/components/cuidador/SolicitudesSection.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import PerfilUsuario from '../common/PerfilUsuario';
import ActionModal from '../common/ActionModal';
import SolicitudCard from './solicitudes/SolicitudCard';
import { cuidadorSolicitudService } from '../../services/api/cuidadorSolicitudAPI';
import { ClipboardList, Sparkles } from 'lucide-react';

const SolicitudesSection = ({
  onSolicitudesCountChange,
  onActionSuccess,
  authUser,
  cuidador
}) => {
  const {
    solicitudes,
    loading,
    error,
    aceptarSolicitud,
    rechazarSolicitud,
    loadSolicitudes,
  } = useSolicitudes();

  const [actionLoading, setActionLoading] = useState(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  const solicitudesAsignadas = useMemo(() => {
    return solicitudes.filter(s => s.estado?.toLowerCase() === 'asignada');
  }, [solicitudes]);

  const [modal, setModal] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Aceptar',
    showCancelButton: false,
    cancelText: 'Cancelar'
  });

  const closeModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const updateCounters = async () => {
      try {
        const todasSolicitudes = await cuidadorSolicitudService.getMisSolicitudes();
        const asignadasCount = todasSolicitudes.filter(s =>
          s.estado === 'Pendiente' || s.estado?.toLowerCase() === 'asignada'
        ).length;

        if (onSolicitudesCountChange) {
          onSolicitudesCountChange(asignadasCount);
        }
      } catch (error) {
        console.error('Error actualizando contadores:', error);
        if (onSolicitudesCountChange) {
          onSolicitudesCountChange(solicitudesAsignadas.length);
        }
      }
    };

    updateCounters();
  }, [solicitudesAsignadas.length, onSolicitudesCountChange, localRefreshTrigger]);

  const handleAceptarSolicitud = async (solicitudId) => {
    try {
      setActionLoading(solicitudId);
      const result = await aceptarSolicitud(solicitudId);

      if (result.success) {
        setModal({
          show: true,
          type: 'success',
          title: '¡Solicitud Aceptada! ✅',
          message: result.message || 'Has aceptado la solicitud exitosamente. Recuerda iniciar el servicio a tiempo.',
          onConfirm: () => {
            closeModal();
            loadSolicitudes();
            setLocalRefreshTrigger(prev => prev + 1);
            if (onActionSuccess) onActionSuccess();
          },
          confirmText: 'Entendido',
          showCancelButton: false
        });
      } else {
        setModal({
          show: true,
          type: 'error',
          title: 'Error al Aceptar',
          message: `Error: ${result.message || 'No se pudo aceptar la solicitud'}`,
          onConfirm: closeModal,
          confirmText: 'Cerrar',
          showCancelButton: false
        });
      }
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        title: 'Error de Conexión',
        message: 'Error al aceptar la solicitud. Inténtalo de nuevo.',
        onConfirm: closeModal,
        confirmText: 'Cerrar',
        showCancelButton: false
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazarSolicitud = async (solicitudId) => {
    setModal({
      show: true,
      type: 'confirm',
      title: '¿Estás seguro?',
      message: '¿Estás seguro de que quieres rechazar esta solicitud? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setActionLoading(solicitudId);
          const result = await rechazarSolicitud(solicitudId);

          if (result.success) {
            setModal({
              show: true,
              type: 'success',
              title: 'Solicitud Rechazada',
              message: result.message || 'La solicitud ha sido rechazada exitosamente.',
              onConfirm: () => {
                closeModal();
                loadSolicitudes();
                setLocalRefreshTrigger(prev => prev + 1);
                if (onActionSuccess) onActionSuccess();
              },
              confirmText: 'Entendido',
              showCancelButton: false
            });
          } else {
            setModal({
              show: true,
              type: 'error',
              title: 'Error al Rechazar',
              message: `Error: ${result.message || 'No se pudo rechazar la solicitud'}`,
              onConfirm: closeModal,
              confirmText: 'Cerrar',
              showCancelButton: false
            });
          }
        } catch (error) {
          setModal({
            show: true,
            type: 'error',
            title: 'Error de Conexión',
            message: 'Error al rechazar la solicitud. Inténtalo de nuevo.',
            onConfirm: closeModal,
            confirmText: 'Cerrar',
            showCancelButton: false
          });
        } finally {
          setActionLoading(null);
        }
      },
      confirmText: 'Sí, Rechazar',
      showCancelButton: true,
      cancelText: 'Cancelar'
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        <span className="ml-3 text-slate-600 font-bold">Cargando solicitudes...</span>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Columna izquierda - Perfil */}
        <div className="lg:col-span-1">
          <PerfilUsuario
            usuario={cuidador}
            tipo="cuidador"
            showStats={true}
            stats={{
              asignadas: solicitudesAsignadas.length,
              aceptadas: solicitudes.filter(s => s.estado?.toLowerCase() === 'aceptada').length
            }}
          />
        </div>

        {/* Columna derecha - Lista */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 mb-6">
              <p className="text-red-600 font-bold flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </p>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] shadow-deep p-8 border border-slate-50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
                  Solicitudes Asignadas
                </h2>
                <p className="text-slate-500 font-medium mt-1">Nuevas oportunidades para cuidar mascotas</p>
              </div>
              <div className="bg-brand-50 text-brand-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                {solicitudesAsignadas.length} Pendientes
              </div>
            </div>

            {solicitudesAsignadas.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-7xl mb-6"><Sparkles className="w-20 h-20 mx-auto text-amber-400 opacity-50" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  ¡Todo al día!
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  No tienes solicitudes de clientes esperando tu respuesta por ahora.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {solicitudesAsignadas.map((solicitud) => (
                  <div key={solicitud.solicitudID} className="hover-lift">
                    <SolicitudCard
                      solicitud={solicitud}
                      actionLoading={actionLoading}
                      handleAceptar={handleAceptarSolicitud}
                      handleRechazar={handleRechazarSolicitud}
                      formatDate={formatDate}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ActionModal
        show={modal.show}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancelButton={modal.showCancelButton}
      />
    </div>
  );
};

export default SolicitudesSection;