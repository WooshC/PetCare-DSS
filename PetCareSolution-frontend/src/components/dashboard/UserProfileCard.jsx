// components/dashboard/UserProfileCard.jsx
import React from 'react';

const UserProfileCard = ({ user, onEditProfile }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        
        {/* Información básica */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{user.name || 'Usuario'}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {user.role || 'Usuario'}
            </span>
            <span className="text-gray-600">{user.email}</span>
          </div>
        </div>

        {/* Botón de editar */}
        <button
          onClick={onEditProfile}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Editar Perfil
        </button>
      </div>

      {/* Información adicional según el rol */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">0</div>
          <div className="text-gray-600">Servicios</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">0</div>
          <div className="text-gray-600">Calificación</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">0</div>
          <div className="text-gray-600">Reseñas</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;