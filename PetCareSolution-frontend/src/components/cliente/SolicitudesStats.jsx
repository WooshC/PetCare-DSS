// components/cliente/SolicitudesStats.jsx
import React from 'react';
import PerfilUsuario from '../common/PerfilUsuario';

const SolicitudesStats = ({ totalSolicitudes, totalPendientes, totalAceptadas, totalEnProgreso, totalFinalizadas }) => {
    // Datos vacíos para PerfilUsuario - asume que los datos reales se manejan dentro de PerfilUsuario
    const cliente = {}; 

    return (
        <div className="lg:col-span-1">
            {/* El componente PerfilUsuario se mantiene aquí */}
            <PerfilUsuario 
                usuario={cliente}
                tipo="cliente"
                showStats={false}
            />

            {/* Estadísticas rápidas */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Resumen de Solicitudes</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-medium">{totalSolicitudes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-yellow-600">Pendientes:</span>
                        <span className="font-medium">{totalPendientes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">Aceptadas:</span>
                        <span className="font-medium">{totalAceptadas}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-purple-600">En Progreso:</span>
                        <span className="font-medium">{totalEnProgreso}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Finalizadas:</span>
                        <span className="font-medium">{totalFinalizadas}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolicitudesStats;