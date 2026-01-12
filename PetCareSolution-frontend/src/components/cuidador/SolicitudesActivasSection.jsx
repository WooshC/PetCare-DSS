// src/components/cuidador/SolicitudesActivasSection.jsx
import React, { useState, useEffect } from 'react';
import PerfilUsuario from '../common/PerfilUsuario';
import ActionModal from '../common/ActionModal';
import SolicitudActivaCard from './solicitudes/SolicitudActivaCard';
import { cuidadorSolicitudService } from '../../services/api/cuidadorSolicitudAPI';
import { Rocket, Sparkles } from 'lucide-react';

const SolicitudesActivasSection = ({
  onSolicitudesCountChange,
  onActionSuccess,
  authUser,
  cuidador
}) => {
  const [solicitudesActivas, setSolicitudesActivas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

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
    const loadSolicitudesActivas = async () => {
      try {
        setLoading(true);
        const data = await cuidadorSolicitudService.getMisSolicitudesActivas();
        setSolicitudesActivas(data);
        if (onSolicitudesCountChange) onSolicitudesCountChange(data.length);
      } catch (error) {
        console.error('Error cargando solicitudes activas:', error);
        setError(error.message);
        if (onSolicitudesCountChange) onSolicitudesCountChange(0);
      } finally {
        setLoading(false);
      }
    };

    loadSolicitudesActivas();
  }, [onSolicitudesCountChange, localRefreshTrigger]);

  const handleIniciarServicio = async (solicitudId) => {
    try {
      setActionLoading(solicitudId);
      const result = await cuidadorSolicitudService.iniciarServicio(solicitudId);

      if (result.success) {
        setModal({
          show: true,
          type: 'success',
          title: '¡Servicio Iniciado! 🚀',
          message: result.message || 'El servicio ha sido iniciado exitosamente.',
          onConfirm: () => {
            closeModal();
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
          title: 'Error al Iniciar',
          message: `Error: ${result.message || 'No se pudo iniciar el servicio'}`,
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
        message: 'Error al iniciar el servicio. Inténtalo de nuevo.',
        onConfirm: closeModal,
        confirmText: 'Cerrar',
        showCancelButton: false
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalizarServicio = async (solicitudId) => {
    setModal({
      show: true,
      type: 'confirm',
      title: '¿Finalizar Servicio?',
      message: '¿Estás seguro de que quieres finalizar este servicio? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          setActionLoading(solicitudId);
          const result = await cuidadorSolicitudService.finalizarServicio(solicitudId);

          if (result.success) {
            setModal({
              show: true,
              type: 'success',
              title: '¡Servicio Finalizado! ✅',
              message: result.message || 'El servicio ha sido finalizado exitosamente.',
              onConfirm: () => {
                closeModal();
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
              title: 'Error al Finalizar',
              message: `Error: ${result.message || 'No se pudo finalizar el servicio'}`,
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
            message: 'Error al finalizar el servicio. Inténtalo de nuevo.',
            onConfirm: closeModal,
            confirmText: 'Cerrar',
            showCancelButton: false
          });
        } finally {
          setActionLoading(null);
        }
      },
      confirmText: 'Sí, Finalizar',
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
        <span className="ml-3 text-slate-600 font-bold">Cargando servicios activos...</span>
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
              activas: solicitudesActivas.length,
              completadas: 0
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
                  Servicios Activos
                </h2>
                <p className="text-slate-500 font-medium mt-1">Gestiona tus cuidados en curso</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                {solicitudesActivas.length} En curso
              </div>
            </div>

            {solicitudesActivas.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-7xl mb-6"><Rocket className="w-20 h-20 mx-auto text-emerald-400 opacity-50" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">
                  ¡Hora de un descanso!
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                  No tienes servicios activos por el momento. Cuando aceptes una solicitud, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {solicitudesActivas.map((solicitud) => (
                  <div key={solicitud.solicitudID} className="hover-lift">
                    <SolicitudActivaCard
                      solicitud={solicitud}
                      expandedCard={expandedCard}
                      actionLoading={actionLoading}
                      toggleExpanded={setExpandedCard}
                      handleIniciar={handleIniciarServicio}
                      handleFinalizar={handleFinalizarServicio}
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

export default SolicitudesActivasSection;