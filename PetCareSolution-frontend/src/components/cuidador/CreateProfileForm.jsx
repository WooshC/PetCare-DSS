// components/cuidador/CreateProfileForm.jsx
import React, { useState } from 'react';
import { PawPrint, Save, X, Phone, DollarSign, Clock, FileText, Award, Shield } from 'lucide-react';
import { caregiverService } from '../../services/api/caregiverAPI';
import { CuidadorRequest } from '../../models/Cuidador';

const CreateProfileForm = ({ authUser, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        documentoIdentidad: '',
        telefonoEmergencia: '',
        biografia: '',
        experiencia: '',
        horarioAtencion: '',
        tarifaPorHora: ''
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.documentoIdentidad || formData.documentoIdentidad.trim().length < 5) {
            newErrors.documentoIdentidad = 'Documento de identidad requerido (mínimo 5 caracteres)';
        }

        if (!formData.telefonoEmergencia || !/^\d{7,15}$/.test(formData.telefonoEmergencia)) {
            newErrors.telefonoEmergencia = 'Teléfono de emergencia inválido (7-15 dígitos)';
        }

        if (!formData.biografia || formData.biografia.trim().length < 20) {
            newErrors.biografia = 'La biografía es requerida (mínimo 20 caracteres)';
        }

        if (formData.biografia && formData.biografia.length > 500) {
            newErrors.biografia = 'La biografía no puede exceder 500 caracteres';
        }

        if (!formData.experiencia || formData.experiencia.trim().length < 20) {
            newErrors.experiencia = 'La experiencia es requerida (mínimo 20 caracteres)';
        }

        if (formData.experiencia && formData.experiencia.length > 1000) {
            newErrors.experiencia = 'La experiencia no puede exceder 1000 caracteres';
        }

        if (!formData.horarioAtencion || formData.horarioAtencion.trim().length < 5) {
            newErrors.horarioAtencion = 'El horario de atención es requerido';
        }

        const tarifa = parseFloat(formData.tarifaPorHora);
        if (!formData.tarifaPorHora || isNaN(tarifa) || tarifa < 1 || tarifa > 1000) {
            newErrors.tarifaPorHora = 'La tarifa debe estar entre $1 y $1000';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setApiError({ type: 'error', message: 'Por favor corrige los errores en el formulario' });
            return;
        }

        setSaving(true);
        setApiError(null);

        try {
            const profileData = new CuidadorRequest(
                formData.documentoIdentidad,
                formData.telefonoEmergencia,
                formData.biografia,
                formData.experiencia,
                parseFloat(formData.tarifaPorHora),
                formData.horarioAtencion
            );

            const response = await caregiverService.createProfile(profileData);

            setApiError({ type: 'success', message: '¡Perfil creado exitosamente!' });
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (error) {
            setApiError({ type: 'error', message: error.message || 'Error al crear el perfil' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-100/50 p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <PawPrint className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                    Crea tu Perfil de Cuidador
                </h2>
                <p className="text-slate-500 font-medium text-lg">
                    Hola <span className="font-bold text-slate-700">{authUser?.name}</span>, completa tu información para comenzar
                </p>
            </div>

            {/* Alert Messages */}
            {apiError && (
                <div className={`mb-6 p-4 rounded-2xl ${apiError.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    <p className="font-bold text-center">{apiError.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Documento de Identidad */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        Documento de Identidad *
                    </label>
                    <input
                        type="text"
                        value={formData.documentoIdentidad}
                        onChange={(e) => handleChange('documentoIdentidad', e.target.value)}
                        placeholder="Ej: 1234567890"
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium ${errors.documentoIdentidad ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.documentoIdentidad && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.documentoIdentidad}</p>
                    )}
                </div>

                {/* Teléfono de Emergencia */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <Phone className="w-4 h-4 mr-2 text-blue-500" />
                        Teléfono de Emergencia *
                    </label>
                    <input
                        type="tel"
                        value={formData.telefonoEmergencia}
                        onChange={(e) => handleChange('telefonoEmergencia', e.target.value)}
                        placeholder="Ej: 0987654321"
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium ${errors.telefonoEmergencia ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.telefonoEmergencia && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.telefonoEmergencia}</p>
                    )}
                </div>

                {/* Tarifa por Hora */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
                        Tarifa por Hora (USD) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="1"
                        max="1000"
                        value={formData.tarifaPorHora}
                        onChange={(e) => handleChange('tarifaPorHora', e.target.value)}
                        placeholder="Ej: 15.00"
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium ${errors.tarifaPorHora ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.tarifaPorHora && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.tarifaPorHora}</p>
                    )}
                </div>

                {/* Horario de Atención */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Horario de Atención *
                    </label>
                    <input
                        type="text"
                        value={formData.horarioAtencion}
                        onChange={(e) => handleChange('horarioAtencion', e.target.value)}
                        placeholder="Ej: Lunes a Viernes 8:00 AM - 6:00 PM"
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium ${errors.horarioAtencion ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.horarioAtencion && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.horarioAtencion}</p>
                    )}
                </div>

                {/* Biografía */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Biografía * ({formData.biografia.length}/500)
                    </label>
                    <textarea
                        value={formData.biografia}
                        onChange={(e) => handleChange('biografia', e.target.value)}
                        placeholder="Cuéntanos sobre ti, tu pasión por los animales y por qué eres un buen cuidador..."
                        rows={4}
                        maxLength={500}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none ${errors.biografia ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.biografia && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.biografia}</p>
                    )}
                </div>

                {/* Experiencia */}
                <div>
                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                        <Award className="w-4 h-4 mr-2 text-blue-500" />
                        Experiencia * ({formData.experiencia.length}/1000)
                    </label>
                    <textarea
                        value={formData.experiencia}
                        onChange={(e) => handleChange('experiencia', e.target.value)}
                        placeholder="Describe tu experiencia previa con mascotas, tipos de animales que has cuidado, certificaciones, cursos, etc."
                        rows={6}
                        maxLength={1000}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none ${errors.experiencia ? 'border-red-300' : 'border-slate-200'
                            }`}
                    />
                    {errors.experiencia && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{errors.experiencia}</p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {saving ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Crear Perfil
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="flex-1 bg-slate-100 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <X className="w-5 h-5 mr-2" />
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProfileForm;
