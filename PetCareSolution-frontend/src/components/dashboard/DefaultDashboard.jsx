// src/components/dashboard/DefaultDashboard.jsx
import React from 'react';

const DefaultDashboard = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header específico para DefaultDashboard */}
      <nav className="bg-gray-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">PetCare Ecuador</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-100">Hola, {user.name || 'Usuario'}</span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Bienvenido a PetCare Ecuador!</h2>
          <p className="text-gray-600 mb-6">
            Tu rol de usuario está siendo verificado. Pronto tendrás acceso a todas las funcionalidades.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DefaultDashboard;