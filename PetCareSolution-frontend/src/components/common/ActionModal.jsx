import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, HelpCircle, AlertTriangle } from 'lucide-react';

const ActionModal = ({
  show = false,
  type = 'info', // 'success', 'error', 'info', 'warning', 'confirm'
  title = '',
  message = '',
  onClose = () => { },
  onConfirm = null,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancelButton = false
}) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [show]);

  if (!show) return null;

  const config = {
    success: {
      color: 'emerald',
      icon: <CheckCircle className="w-12 h-12 text-emerald-500" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
    },
    error: {
      color: 'red',
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200'
    },
    warning: {
      color: 'amber',
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
    },
    confirm: {
      color: 'blue',
      icon: <HelpCircle className="w-12 h-12 text-blue-500" />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
    },
    info: {
      color: 'indigo',
      icon: <Info className="w-12 h-12 text-indigo-500" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
    }
  };

  const style = config[type] || config.info;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop con Blur Progresivo */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100">

          {/* Header Decorativo */}
          <div className={`h-2 w-full bg-gradient-to-r from-${style.color}-400 to-${style.color}-600`} />

          <div className="p-8 pt-10">
            {/* Ícono Central con Animación Suave */}
            <div className={`mx-auto w-20 h-20 ${style.bg} rounded-3xl flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform duration-300`}>
              {style.icon}
            </div>

            {/* Contenido de Texto */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                {title}
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {message}
              </p>
            </div>

            {/* Botones de Acción Estilizados */}
            <div className="mt-10 space-y-3">
              <button
                onClick={handleConfirm}
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 active:scale-[0.98] shadow-lg ${style.btn}`}
              >
                {confirmText}
              </button>

              {showCancelButton && (
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl text-slate-500 font-bold text-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  {cancelText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;