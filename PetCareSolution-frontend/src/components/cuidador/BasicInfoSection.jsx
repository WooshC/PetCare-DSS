// components/cuidador/BasicInfoSection.jsx
import React from 'react';
import { User, ShieldCheck, Clock, Phone, Mail, FileText, BadgeCheck, AlertCircle } from 'lucide-react';

const BasicInfoSection = ({
  authUser,
  cuidador,
  editing,
  editData,
  editErrors,
  onEditChange,
  formatPhone,
  formatDate
}) => {
  if (!authUser) return null;

  const InfoBox = ({ label, value, icon: Icon, subtext, children }) => (
    <div className="p-5 border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex items-center space-x-3 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      {children || <p className="text-sm font-bold text-slate-700">{value || 'No especificado'}</p>}
      {subtext && <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-deep overflow-hidden border border-slate-50">
      <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-brand-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Información de Cuenta</h3>
        </div>
        {!cuidador?.documentoVerificado && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-tight">Validación pendiente</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-slate-50">
        <InfoBox
          label="Teléfono Principal"
          value={formatPhone(cuidador?.telefonoUsuario || authUser?.phoneNumber || '')}
          icon={Phone}
          subtext="Vinculado a tu cuenta"
        />

        <InfoBox
          label="Documento ID"
          value={cuidador?.documentoIdentidad}
          icon={FileText}
        />

        <div className="p-5 border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teléfono Emergencia</span>
          </div>
          {editing ? (
            <div className="mt-2">
              <input
                type="text"
                value={editData.telefonoEmergencia || ''}
                onChange={(e) => onEditChange('telefonoEmergencia', e.target.value)}
                className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold focus:ring-0 transition-all ${editErrors.telefonoEmergencia ? 'border-red-200 focus:border-red-500' : 'border-slate-100 focus:border-brand-500'
                  }`}
                placeholder="Ej: 0987654321"
              />
              {editErrors.telefonoEmergencia && (
                <p className="text-red-500 text-[10px] font-black mt-1 uppercase">{editErrors.telefonoEmergencia}</p>
              )}
            </div>
          ) : (
            <p className="text-sm font-bold text-slate-700">{cuidador?.telefonoEmergencia || 'Sin configurar'}</p>
          )}
        </div>

        <InfoBox
          label="Correo Electrónico"
          value={cuidador?.emailUsuario || authUser?.email}
          icon={Mail}
          subtext="Correo institucional"
        />

        <InfoBox label="Estatus Legal" icon={ShieldCheck}>
          <div className="flex items-center mt-1">
            {cuidador?.documentoVerificado ? (
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                <BadgeCheck className="h-3.5 w-3.5 mr-2" />
                Verificado
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                <Clock className="h-3.5 w-3.5 mr-2" />
                Pendiente
              </span>
            )}
          </div>
        </InfoBox>

        <InfoBox
          label="Miembro Desde"
          value={formatDate(cuidador?.fechaCreacion)}
          icon={Clock}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;