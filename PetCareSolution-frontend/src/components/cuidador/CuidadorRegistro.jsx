// components/cuidador/CuidadorRegistro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Phone, User, Clock, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { caregiverService } from '../../services/api/caregiverAPI';

const CuidadorRegistro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    documentoIdentidad: '',
    telefonoEmergencia: '',
    biografia: '',
    experiencia: '',
    horarioAtencion: '',
    tarifaPorHora: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.documentoIdentidad.trim()) {
      errors.push('El documento de identidad es requerido');
    }
    
    if (!formData.telefonoEmergencia.trim()) {
      errors.push('El teléfono de emergencia es requerido');
    }
    
    if (!formData.tarifaPorHora || parseFloat(formData.tarifaPorHora) <= 0) {
      errors.push('La tarifa por hora debe ser mayor a 0');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos según el DTO del backend
      const payload = {
        documentoIdentidad: formData.documentoIdentidad.trim(),
        telefonoEmergencia: formData.telefonoEmergencia.trim(),
        biografia: formData.biografia.trim() || null,
        experiencia: formData.experiencia.trim() || null,
        horarioAtencion: formData.horarioAtencion.trim() || null,
        tarifaPorHora: parseFloat(formData.tarifaPorHora)
      };

      console.log('📤 Enviando datos:', payload);

      const response = await caregiverService.createProfile(payload);
      
      console.log('✅ Perfil creado exitosamente:', response);
      
      setSuccess(true);
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('❌ Error al crear perfil:', error);
      setError(error.message || 'Error al crear el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🐾 Registro de Cuidador
          </h1>
          <p className="text-gray-600">
            Completa tu perfil para comenzar a ofrecer tus servicios de cuidado de mascotas
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-6 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Error en el registro</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-2xl p-6 mb-6 flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-green-800 mb-1">¡Perfil creado exitosamente!</h3>
              <p className="text-green-700 text-sm">Redirigiendo al dashboard...</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8">
          <div className="space-y-6">
            {/* Documento de Identidad */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Documento de Identidad *
              </label>
              <input
                type="text"
                name="documentoIdentidad"
                value={formData.documentoIdentidad}
                onChange={handleChange}
                placeholder="Ej: 1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading || success}
              />
            </div>

            {/* Teléfono de Emergencia */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Teléfono de Emergencia *
              </label>
              <input
                type="tel"
                name="telefonoEmergencia"
                value={formData.telefonoEmergencia}
                onChange={handleChange}
                placeholder="Ej: +593991234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading || success}
              />
            </div>

            {/* Biografía */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                Biografía
              </label>
              <textarea
                name="biografia"
                value={formData.biografia}
                onChange={handleChange}
                placeholder="Cuéntanos sobre ti y tu amor por las mascotas..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                disabled={loading || success}
              />
            </div>

            {/* Experiencia */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                Experiencia
              </label>
              <textarea
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange}
                placeholder="Describe tu experiencia cuidando mascotas..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                disabled={loading || success}
              />
            </div>

            {/* Horario de Atención */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Horario de Atención
              </label>
              <input
                type="text"
                name="horarioAtencion"
                value={formData.horarioAtencion}
                onChange={handleChange}
                placeholder="Ej: Lun-Vie 9AM-6PM, Sáb 10AM-2PM"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading || success}
              />
            </div>

            {/* Tarifa por Hora */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Tarifa por Hora (USD) *
              </label>
              <input
                type="number"
                name="tarifaPorHora"
                value={formData.tarifaPorHora}
                onChange={handleChange}
                placeholder="Ej: 15.00"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading || success}
              />
            </div>

            {/* Botón de Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando perfil...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  ¡Perfil creado!
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Registrar Perfil de Cuidador
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Los campos marcados con * son obligatorios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuidadorRegistro;