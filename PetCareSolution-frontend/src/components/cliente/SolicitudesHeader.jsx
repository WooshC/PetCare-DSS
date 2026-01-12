// components/cliente/SolicitudesHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const SolicitudesHeader = ({ onOpenCreateModal }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mis Solicitudes</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                    Gestiona tus solicitudes de cuidado para mascotas
                </p>
            </div>
            <button
                onClick={onOpenCreateModal}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 flex items-center font-bold text-sm"
            >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
            </button>
        </div>
    );
};

export default SolicitudesHeader;