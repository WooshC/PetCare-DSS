// src/components/cuidador/solicitudes/SolicitudCardHeader.jsx
import React from 'react';

const SolicitudCardHeader = ({ solicitud, formatDate }) => {

  const getEstadoBadge = (estado) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    const estadoLower = estado?.toLowerCase();
    
    switch (estadoLower) {
      case 'pendiente':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⏳ Pendiente</span>;
      case 'asignada':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>📋 Asignada</span>;
      case 'aceptada':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>✅ Aceptada</span>;
      case 'en progreso':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>🚀 En Progreso</span>;
      case 'finalizada':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>🏁 Finalizada</span>;
      case 'rechazada':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>❌ Rechazada</span>;
      case 'cancelada':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>🚫 Cancelada</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{estado}</span>;
    }
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-2">
            <span className="mr-2">👤</span>
            <h4 className="font-semibold text-gray-800">
              {solicitud.nombreCliente || 'Cliente'}
            </h4>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            {formatDate(solicitud.fechaHoraInicio)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {solicitud.tipoServicio}
          </span>
          {getEstadoBadge(solicitud.estado)}
        </div>
      </div>
    </div>
  );
};

export default SolicitudCardHeader;