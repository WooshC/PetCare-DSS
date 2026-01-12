// components/cuidador/ServicesSection.jsx
import React from 'react';
import { DollarSign, Clock, Layout, Tag } from 'lucide-react';

const ServicesSection = ({
  cuidador,
  editing,
  editData,
  editErrors,
  onEditChange,
  formatCurrency
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-deep overflow-hidden border border-slate-50">
      <div className="bg-slate-900 px-6 py-4 flex items-center space-x-3">
        <Layout className="h-5 w-5 text-brand-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Servicios y Tarifas</h3>
      </div>

      <div className="divide-y divide-slate-50">
        {/* Tarifa por Hora */}
        <div className="p-6 group hover:bg-slate-50 transition-colors">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Tarifa por Hora</label>
          {editing ? (
            <div>
              <div className="relative group/input">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  value={editData.tarifaPorHora || ''}
                  onChange={(e) => onEditChange('tarifaPorHora', parseFloat(e.target.value) || 0)}
                  className={`w-full pl-8 pr-4 py-3 bg-white border-2 rounded-xl text-lg font-black focus:ring-0 transition-all ${editErrors.tarifaPorHora ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-brand-500'
                    }`}
                  placeholder="0.00"
                  min="0"
                  max="1000"
                  step="0.5"
                />
              </div>
              {editErrors.tarifaPorHora && (
                <p className="text-red-500 text-[10px] font-black mt-1 uppercase">{editErrors.tarifaPorHora}</p>
              )}
            </div>
          ) : (
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-black text-emerald-600 tracking-tight">{formatCurrency(cuidador?.tarifaPorHora).replace('$', '')}</span>
              <span className="text-xs font-bold text-slate-400">USD/hr</span>
            </div>
          )}
        </div>

        {/* Horario de Atención */}
        <div className="p-6 group hover:bg-slate-50 transition-colors">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Horario de Atención</label>
          </div>
          {editing ? (
            <input
              type="text"
              value={editData.horarioAtencion || ''}
              onChange={(e) => onEditChange('horarioAtencion', e.target.value)}
              className="w-full p-3 bg-white border-2 border-slate-100 focus:border-brand-500 rounded-xl text-sm font-bold transition-all focus:ring-0"
              placeholder="Ej: Lun - Vie 08:00 - 18:00"
            />
          ) : (
            <p className="text-sm font-bold text-slate-700">{cuidador?.horarioAtencion || 'No especificado'}</p>
          )}
        </div>

        {/* Disponibilidad */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estado Actual</label>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
            En línea
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;