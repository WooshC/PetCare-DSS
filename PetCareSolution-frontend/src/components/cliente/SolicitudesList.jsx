// components/cliente/SolicitudesList.jsx
import React from 'react';
import SolicitudCard from './SolicitudCard';

const SolicitudesList = ({
    solicitudes,
    error,
    onAsignarCuidador,
    onCancelarSolicitud,
    actionLoading,
    onOpenCreateModal,
    onCalificar
}) => {

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 mb-6">
                <p className="text-red-600 font-bold flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </p>
            </div>
        );
    }

    if (solicitudes.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="text-7xl mb-6">📋</div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">
                    No hay solicitudes
                </h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                    Comienza creando tu primera solicitud de cuidado para mascotas.
                    Te guiaremos en cada paso para encontrar al cuidador ideal.
                </p>
                <button
                    onClick={onOpenCreateModal}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl hover:bg-blue-700 shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 font-black text-sm uppercase tracking-wider"
                >
                    Crear Mi Primera Solicitud
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {solicitudes.map((solicitud) => (
                <div key={solicitud.solicitudID} className="hover-lift">
                    <SolicitudCard
                        solicitud={solicitud}
                        onAsignarCuidador={onAsignarCuidador}
                        onCancelarSolicitud={onCancelarSolicitud}
                        onCalificar={onCalificar}
                        actionLoading={actionLoading}
                    />
                </div>
            ))}
        </div>
    );
};

export default SolicitudesList;