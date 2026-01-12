import React from 'react';

const MascotasSection = ({ onMascotasCountChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Mascotas</h2>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐾</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Gestión de Mascotas
        </h3>
        <p className="text-gray-500 mb-6">
          Aquí podrás gestionar toda la información de tus mascotas.
        </p>
        <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
          Agregar Mascota
        </button>
      </div>
    </div>
  );
};

export default MascotasSection;