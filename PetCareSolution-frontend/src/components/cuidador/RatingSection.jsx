// components/RatingSection.jsx
import React from 'react';

const RatingSection = ({ cuidador }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Calificación</h3>
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-600 mb-2">
          {cuidador?.calificacionPromedio > 0 ? cuidador.calificacionPromedio.toFixed(1) : '0.0'}/5.0
        </div>
        <div className="flex justify-center space-x-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xl ${
                star <= (cuidador?.calificacionPromedio || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {cuidador?.calificacionPromedio > 0 ? 'Calificaciones recibidas' : 'Sin calificaciones aún'}
        </p>
      </div>
    </div>
  );
};

export default RatingSection;