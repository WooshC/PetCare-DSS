// src/components/cliente/CrearSolicitudModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { SolicitudTiposServicio } from '../../models/Solicitud';

const CrearSolicitudModal = ({ isOpen, onClose, onCreateSolicitud, loading }) => {
  const [formData, setFormData] = useState({
    tipoServicio: '',
    descripcion: '',
    fechaHoraInicio: '',
    duracionHoras: 1,
    ubicacion: '',
    cuidadorID: null,
    modoPago: 'PayPal'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tipoServicio) newErrors.tipoServicio = 'Campo requerido';
    if (!formData.descripcion || formData.descripcion.length < 10) newErrors.descripcion = 'Mínimo 10 caracteres';
    if (!formData.fechaHoraInicio) newErrors.fechaHoraInicio = 'Campo requerido';
    if (!formData.ubicacion) newErrors.ubicacion = 'Campo requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onCreateSolicitud(formData);
      setFormData({ tipoServicio: '', descripcion: '', fechaHoraInicio: '', duracionHoras: 1, ubicacion: '', cuidadorID: null });
    } catch (error) { console.error(error); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop con desenfoque elegante */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container con diseño "Premium Card" */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-slate-100 flex flex-col md:flex-row">

        {/* Lado Izquierdo: Visual/Info (Visible en MD+) */}
        <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 flex-col justify-between text-white">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold leading-tight">Configura tu solicitud</h2>
            <p className="mt-4 text-blue-100 font-medium">Completa los detalles para encontrar al cuidador perfecto para tu mascota.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm bg-white/10 p-3 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Cuidadores disponibles</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto max-h-[85vh]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Nueva Solicitud
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Servicio con diseño de botones radio o select estilizado */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">¿Qué servicio necesitas?</label>
              <div className="relative">
                <select
                  name="tipoServicio"
                  value={formData.tipoServicio}
                  onChange={handleChange}
                  className={`w-full p-4 bg-slate-50 border-2 rounded-2xl appearance-none focus:ring-0 transition-all ${errors.tipoServicio ? 'border-red-200' : 'border-transparent focus:border-blue-500 hover:bg-slate-100'
                    }`}
                >
                  <option value="">Selecciona una opción</option>
                  {Object.entries(SolicitudTiposServicio).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
              {errors.tipoServicio && <p className="text-red-500 text-xs mt-2 font-bold">{errors.tipoServicio}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Detalles adicionales</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Ej: Mi perro es juguetón pero necesita medicación a las 4pm..."
                className={`w-full p-4 bg-slate-50 border-2 rounded-2xl focus:ring-0 transition-all resize-none ${errors.descripcion ? 'border-red-200' : 'border-transparent focus:border-blue-500'
                  }`}
              />
              {errors.descripcion && <p className="text-red-500 text-xs mt-2 font-bold">{errors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">¿Cuándo inicia?</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                  <input
                    type="datetime-local"
                    name="fechaHoraInicio"
                    value={formData.fechaHoraInicio}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">¿Por cuánto tiempo?</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600 w-5 h-5" />
                  <input
                    type="number"
                    name="duracionHoras"
                    value={formData.duracionHoras}
                    onChange={handleChange}
                    min="1"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">hrs</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">¿Dónde se realizará?</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Dirección exacta o referencia"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Método de Pago</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.modoPago === 'PayPal' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input
                    type="radio"
                    name="modoPago"
                    value="PayPal"
                    checked={formData.modoPago === 'PayPal'}
                    onChange={handleChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer inset-0"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-700">PayPal</span>
                    <span className="text-xs text-slate-500 text-center">Pago online seguro</span>
                  </div>
                </label>

                <label className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.modoPago === 'Fisico' ? 'border-green-500 bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <input
                    type="radio"
                    name="modoPago"
                    value="Fisico"
                    checked={formData.modoPago === 'Fisico'}
                    onChange={handleChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer inset-0"
                  />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-700">Físico / Efectivo</span>
                    <span className="text-xs text-slate-500 text-center">Acuerdo con cuidador</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-300 flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Confirmar Solicitud
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearSolicitudModal;