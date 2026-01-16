// components/cliente/SolicitudesSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import SolicitudesHeader from './SolicitudesHeader';
import SolicitudesList from './SolicitudesList';
import ProcessGuide from './ProcessGuide';
import Pagination from '../ui/Pagination';

import CrearSolicitudModal from './CrearSolicitudModal';
import CuidadoresModal from './CuidadoresModal';
import CalificarModal from './CalificarModal';
import ActionModal from '../common/ActionModal';
import { useClienteSolicitudes } from '../../hooks/useClienteSolicitudes';

const SolicitudesSection = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCuidadoresModal, setShowCuidadoresModal] = useState(false);
    const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [showCalificarModal, setShowCalificarModal] = useState(false);
    const [selectedSolicitudForRating, setSelectedSolicitudForRating] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Estado para el ActionModal
    const [modal, setModal] = useState({
        show: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Aceptar',
        showCancelButton: false,
        cancelText: 'Cerrar'
    });

    const {
        solicitudes,
        loading,
        error,
        createSolicitud,
        asignarCuidador,
        cancelarSolicitud,
        totalPendientes,
        totalAceptadas,
        totalEnProgreso,
        totalFinalizadas
    } = useClienteSolicitudes();

    // Filtrar solicitudes activas (no finalizadas ni canceladas)
    const activeSolicitudes = useMemo(() => {
        return solicitudes.filter(s => s.estado !== 'Finalizada' && s.estado !== 'Cancelada');
    }, [solicitudes]);

    // Paginated solicitudes
    const paginatedSolicitudes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return activeSolicitudes.slice(start, start + ITEMS_PER_PAGE);
    }, [activeSolicitudes, currentPage]);

    const totalPages = Math.ceil(activeSolicitudes.length / ITEMS_PER_PAGE);

    const handleCreateSolicitud = async (solicitudData) => {
        try {
            const result = await createSolicitud(solicitudData);
            if (result.success) {
                setShowCreateModal(false);
                setModal({
                    show: true,
                    type: 'success',
                    title: '¡Solicitud Creada! ✅',
                    message: 'Tu solicitud ha sido creada exitosamente. Ahora puedes asignar un cuidador.',
                    onConfirm: () => setModal({ ...modal, show: false }),
                    confirmText: 'Entendido',
                    showCancelButton: false
                });
            } else {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Error al Crear',
                    message: `Error: ${result.message}`,
                    onConfirm: () => setModal({ ...modal, show: false }),
                    confirmText: 'Cerrar',
                    showCancelButton: false
                });
            }
        } catch (error) {
            console.error('Error creating solicitud:', error);
            setModal({
                show: true,
                type: 'error',
                title: 'Error de Conexión',
                message: 'Error al crear la solicitud. Inténtalo de nuevo.',
                onConfirm: () => setModal({ ...modal, show: false }),
                confirmText: 'Cerrar',
                showCancelButton: false
            });
        }
    };

    const handleAsignarCuidador = (solicitudId) => {
        setSelectedSolicitudId(solicitudId);
        setShowCuidadoresModal(true);
    };

    const handleConfirmarAsignacion = async (cuidadorId) => {
        setActionLoading(selectedSolicitudId);
        try {
            const result = await asignarCuidador(selectedSolicitudId, cuidadorId);
            if (result.success) {
                setShowCuidadoresModal(false);
                setSelectedSolicitudId(null);
                setModal({
                    show: true,
                    type: 'success',
                    title: '¡Cuidador Asignado! 👥',
                    message: 'El cuidador ha sido asignado exitosamente. Espera su confirmación.',
                    onConfirm: () => setModal({ ...modal, show: false }),
                    confirmText: 'Entendido',
                    showCancelButton: false
                });
            } else {
                setModal({
                    show: true,
                    type: 'error',
                    title: 'Error al Asignar',
                    message: `Error: ${result.message}`,
                    onConfirm: () => setModal({ ...modal, show: false }),
                    confirmText: 'Cerrar',
                    showCancelButton: false
                });
            }
        } catch (error) {
            setModal({
                show: true,
                type: 'error',
                title: 'Error de Conexión',
                message: 'Error al asignar el cuidador. Inténtalo de nuevo.',
                onConfirm: () => setModal({ ...modal, show: false }),
                confirmText: 'Cerrar',
                showCancelButton: false
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelarSolicitud = async (solicitudId) => {
        setModal({
            show: true,
            type: 'confirm',
            title: '¿Estás seguro?',
            message: '¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                setModal({ ...modal, show: false });
                try {
                    setActionLoading(solicitudId);
                    const result = await cancelarSolicitud(solicitudId);
                    if (result.success) {
                        setModal({
                            show: true,
                            type: 'success',
                            title: 'Solicitud Cancelada',
                            message: 'La solicitud ha sido cancelada exitosamente.',
                            onConfirm: () => setModal({ ...modal, show: false }),
                            confirmText: 'Entendido',
                            showCancelButton: false
                        });
                    } else {
                        setModal({
                            show: true,
                            type: 'error',
                            title: 'Error al Cancelar',
                            message: `Error: ${result.message}`,
                            onConfirm: () => setModal({ ...modal, show: false }),
                            confirmText: 'Cerrar',
                            showCancelButton: false
                        });
                    }
                } catch (error) {
                    setModal({
                        show: true,
                        type: 'error',
                        title: 'Error de Conexión',
                        message: 'Error al cancelar la solicitud. Inténtalo de nuevo.',
                        onConfirm: () => setModal({ ...modal, show: false }),
                        confirmText: 'Cerrar',
                        showCancelButton: false
                    });
                } finally {
                    setActionLoading(null);
                }
            },
            confirmText: 'Sí, Cancelar',
            showCancelButton: true,
            cancelText: 'Mantener'
        });
    };

    if (loading && solicitudes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                <span className="ml-3 text-slate-600 font-bold">Cargando solicitudes...</span>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-5xl mx-auto">
            <ProcessGuide />

            <div className="bg-white rounded-[2rem] shadow-deep p-8 border border-slate-50">
                <SolicitudesHeader onOpenCreateModal={() => setShowCreateModal(true)} />

                <SolicitudesList
                    solicitudes={paginatedSolicitudes}
                    error={error}
                    onAsignarCuidador={handleAsignarCuidador}
                    onCancelarSolicitud={handleCancelarSolicitud}
                    onCalificar={(s) => { setSelectedSolicitudForRating(s); setShowCalificarModal(true); }}
                    actionLoading={actionLoading}
                    onOpenCreateModal={() => setShowCreateModal(true)}
                />

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Modales */}
            <CrearSolicitudModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateSolicitud={handleCreateSolicitud}
                loading={loading}
            />

            <CuidadoresModal
                isOpen={showCuidadoresModal}
                onClose={() => { setShowCuidadoresModal(false); setSelectedSolicitudId(null); }}
                onAsignarCuidador={handleConfirmarAsignacion}
                solicitudId={selectedSolicitudId}
                loading={actionLoading === selectedSolicitudId}
            />

            {showCalificarModal && selectedSolicitudForRating && (
                <CalificarModal
                    solicitud={selectedSolicitudForRating}
                    onClose={() => { setShowCalificarModal(false); setSelectedSolicitudForRating(null); }}
                    onSuccess={() => {
                        setModal({
                            show: true,
                            type: 'success',
                            title: '¡Gracias por calificar!',
                            message: 'Tu calificación ha sido registrada exitosamente.',
                            onConfirm: () => setModal({ ...modal, show: false }),
                            confirmText: 'Cerrar',
                            showCancelButton: false
                        });
                    }}
                />
            )}

            <ActionModal
                show={modal.show}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal({ ...modal, show: false })}
                onConfirm={modal.onConfirm}
                confirmText={modal.confirmText}
                cancelText={modal.cancelText}
                showCancelButton={modal.showCancelButton}
            />
        </div>
    );
};

export default SolicitudesSection;