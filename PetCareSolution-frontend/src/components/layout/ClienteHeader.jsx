// src/components/layout/ClienteHeader.jsx
import React from 'react';
import { User, Bell, ClipboardList, LogOut, PawPrint } from 'lucide-react';

const ClienteHeader = ({
  currentSection,
  onSectionChange,
  onLogout,
  clienteName = 'Cliente',
  solicitudesCount = 0
}) => {
  const sections = [
    {
      key: 'perfil',
      label: 'Mi Perfil',
      icon: <User className="w-5 h-5" />
    },
    {
      key: 'solicitudes',
      label: 'Solicitudes',
      icon: <Bell className="w-5 h-5" />,
      badge: solicitudesCount
    },
    {
      key: 'historial',
      label: 'Historial',
      icon: <ClipboardList className="w-5 h-5" />
    }
  ];

  return (
    <nav className="bg-slate-900 border-b border-white/5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primera fila: Logo y usuario */}
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
              <img src="/petcare-logo.png" alt="PetCare Logo" className="w-full h-full object-contain filter drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-white tracking-tight">
                PetCare <span className="text-emerald-400">Ecuador</span>
              </h1>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Panel del Cliente</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10 text-right">
              <div>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter block leading-none mb-1">Tu Cuenta</span>
                <span className="text-white font-bold text-sm tracking-tight">{clienteName}</span>
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
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className={`transition-transform duration-200 ${currentSection === section.key ? 'scale-110 text-emerald-400' : 'group-hover:scale-110'
                    }`}>
                    {section.icon}
                  </span>
                  <span className="font-bold tracking-tight">{section.label}</span>
                  {section.badge > 0 && (
                    <span className="relative bg-emerald-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg min-w-[1.25rem]">
                      {section.badge}
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                    </span>
                  )}
                </span>

                {currentSection === section.key && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ClienteHeader;