// components/layout/CuidadorHeader.jsx
import React, { useState, useEffect } from 'react';
import { User, Bell, CheckCircle2, ClipboardList, LogOut, PawPrint } from 'lucide-react';

const CuidadorHeader = ({
  currentSection,
  onSectionChange,
  onLogout,
  cuidadorName = 'Cuidador',
  solicitudesAsignadasCount = 0,
  solicitudesActivasCount = 0,
  refreshTrigger = 0
}) => {
  const [contadores, setContadores] = useState({
    asignadas: solicitudesAsignadasCount,
    activas: solicitudesActivasCount
  });

  useEffect(() => {
    setContadores({
      asignadas: solicitudesAsignadasCount,
      activas: solicitudesActivasCount
    });
  }, [solicitudesAsignadasCount, solicitudesActivasCount, refreshTrigger]);

  const sections = [
    {
      key: 'perfil',
      label: 'Mi Perfil',
      icon: <User className="w-5 h-5" />,
      description: 'Gestiona tu perfil'
    },
    {
      key: 'solicitudes',
      label: 'Asignadas',
      icon: <Bell className="w-5 h-5" />,
      badge: contadores.asignadas,
      description: 'Solicitudes asignadas pendientes de respuesta'
    },
    {
      key: 'solicitudes-activas',
      label: 'Servicios Activos',
      icon: <CheckCircle2 className="w-5 h-5" />,
      badge: contadores.activas,
      description: 'Servicios aceptados y en progreso'
    },
    {
      key: 'historial',
      label: 'Historial',
      icon: <ClipboardList className="w-5 h-5" />,
      description: 'Historial completo de servicios'
    }
  ];

  const getBadgeTooltip = (section) => {
    if (!section.badge) return null;

    switch (section.key) {
      case 'solicitudes':
        return `${section.badge} solicitud${section.badge !== 1 ? 'es' : ''} asignada${section.badge !== 1 ? 's' : ''}`;
      case 'solicitudes-activas':
        return `${section.badge} servicio${section.badge !== 1 ? 's' : ''} activo${section.badge !== 1 ? 's' : ''} (Aceptados + En Progreso)`;
      default:
        return `${section.badge} notificaciones`;
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-white/5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primera fila: Logo y usuario */}
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 transform hover:rotate-12 transition-transform duration-300">
              <PawPrint className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white tracking-tight">
                PetCare <span className="text-brand-400">Ecuador</span>
              </h1>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Panel del Cuidador</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Contadores rápidos */}
            <div className="hidden lg:flex items-center space-x-3">
              {(contadores.asignadas > 0 || contadores.activas > 0) && (
                <>
                  {contadores.asignadas > 0 && (
                    <div
                      className="flex items-center space-x-2 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20"
                      title={`${contadores.asignadas} asignadas`}
                    >
                      <Bell className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-brand-400 text-xs font-black">{contadores.asignadas}</span>
                    </div>
                  )}
                  {contadores.activas > 0 && (
                    <div
                      className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
                      title={`${contadores.activas} activas`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-black">{contadores.activas}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center space-x-4 pl-6 border-l border-white/10 text-right">
              <div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter block leading-none mb-1">Tu Perfil</span>
                <span className="text-white font-bold text-sm tracking-tight">{cuidadorName}</span>
              </div>

              <button
                onClick={onLogout}
                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Segunda fila: Navegación */}
        <div className="border-t border-white/5">
          <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                className={`group relative flex items-center py-3 px-4 font-medium text-sm whitespace-nowrap transition-all duration-300 rounded-lg mx-1 min-w-max ${currentSection === section.key
                    ? 'text-white bg-white/5 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                title={section.description}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className={`transition-transform duration-200 ${currentSection === section.key ? 'scale-110 text-brand-400' : 'group-hover:scale-110'
                    }`}>
                    {section.icon}
                  </span>
                  <span className="font-bold tracking-tight">{section.label}</span>
                  {section.badge > 0 && (
                    <span
                      className={`relative ${section.key === 'solicitudes'
                          ? 'bg-brand-500'
                          : 'bg-emerald-500'
                        } text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg min-w-[1.25rem]`}
                    >
                      {section.badge}
                      {section.key === 'solicitudes' && (
                        <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping opacity-75"></span>
                      )}
                    </span>
                  )}
                </span>

                {currentSection === section.key && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-500 rounded-full shadow-glow"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CuidadorHeader;