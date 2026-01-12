// components/cuidador/StatsSection.jsx
import React from 'react';
import { BarChart3, Star, Users, Clock, Heart } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { value: '0', label: 'Servicios', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { value: '0', label: 'Clientes', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: '0', label: 'Horas', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: '0', label: 'Reseñas', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' }
  ];

  return (
    <div className="bg-white rounded-[2rem] shadow-deep overflow-hidden border border-slate-50">
      <div className="bg-slate-900 px-6 py-4 flex items-center space-x-3">
        <BarChart3 className="h-5 w-5 text-brand-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Rendimiento</h3>
      </div>

      <div className="p-6 grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-slate-100 transition-all group">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5 shadow-sm" />
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;