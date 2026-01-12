// components/ProfileHeader.jsx
import React from 'react';
import { Edit3, Save, X } from 'lucide-react';

const ProfileHeader = ({ 
  userName, 
  editing, 
  saving, 
  onEditStart, 
  onSave, 
  onCancel,
  error 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Bienvenido, {userName}!
          </h2>
          <p className="text-gray-600">
            Gestiona tus servicios y conecta con dueños de mascotas.
          </p>
        </div>
        
        <div className="flex space-x-3">
          {!editing ? (
            <button
              onClick={onEditStart}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
              <button
                onClick={onCancel}
                disabled={saving}
                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {error && typeof error === 'object' && (
        <div className={`mt-3 rounded p-3 ${
          error.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;