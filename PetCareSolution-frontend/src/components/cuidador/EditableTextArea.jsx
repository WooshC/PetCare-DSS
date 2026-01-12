// components/cuidador/EditableTextArea.jsx
import React from 'react';
import { FileText, Edit2 } from 'lucide-react';

const EditableTextArea = ({
  title,
  icon: Icon = FileText,
  value,
  editing,
  editErrors,
  fieldName,
  placeholder,
  maxLength,
  onEditChange
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-deep overflow-hidden border border-slate-50 relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Icon className="w-24 h-24" />
      </div>

      <div className="bg-slate-900 px-8 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-brand-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
        </div>
        {editing && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full">
            <Edit2 className="w-3 h-3 text-brand-400" />
            <span className="text-[9px] font-black text-brand-400 uppercase tracking-tight">Editando modo</span>
          </div>
        )}
      </div>

      <div className="p-8 relative z-10">
        {editing ? (
          <div>
            <textarea
              value={value || ''}
              onChange={(e) => onEditChange(fieldName, e.target.value)}
              rows={fieldName === 'experiencia' ? 6 : 4}
              className={`w-full p-6 bg-slate-50 border-2 rounded-[2rem] resize-none text-slate-700 font-medium placeholder:text-slate-300 focus:bg-white focus:ring-0 transition-all ${editErrors[fieldName] ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-brand-500'
                }`}
              placeholder={placeholder}
              maxLength={maxLength}
            />
            <div className="flex justify-between items-center mt-3 px-2">
              <div className="flex-1">
                {editErrors[fieldName] && <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">{editErrors[fieldName]}</p>}
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase">
                {(value || '').length} / {maxLength}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {value ? (
              <p className="text-slate-600 leading-relaxed font-medium text-sm whitespace-pre-line bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50 italic">
                "{value}"
              </p>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <Icon className="w-10 h-10 mx-auto text-slate-200 mb-4 opacity-50" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Sección de {title} vacía
                </p>
                <p className="text-[10px] text-slate-300 font-medium mt-1">Pulsa editar perfil para agregar contenido</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableTextArea;