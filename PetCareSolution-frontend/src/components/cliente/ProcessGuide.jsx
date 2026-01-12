// components/cliente/ProcessGuide.jsx
import React from 'react';
import { ClipboardList, Users, ShieldCheck } from 'lucide-react';

const ProcessGuide = () => {
    const steps = [
        {
            id: '1',
            title: 'Crea tu solicitud',
            description: 'Describe el servicio, fecha, ubicación y mascota',
            icon: <ClipboardList className="w-6 h-6" />,
            color: 'bg-brand-50 text-brand-600',
        },
        {
            id: '2',
            title: 'Elige un cuidador',
            description: 'Selecciona de la lista de cuidadores disponibles',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-emerald-50 text-emerald-600',
        },
        {
            id: '3',
            title: 'Espera confirmación',
            description: 'El cuidador aceptará o rechazará tu solicitud',
            icon: <ShieldCheck className="w-6 h-6" />,
            color: 'bg-amber-50 text-amber-600',
        },
    ];

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-soft mb-8">
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center">
                <span className="mr-3">💡</span>
                ¿Cómo funciona el proceso?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="relative">
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 shadow-sm relative group-hover:scale-110 transition-transform duration-500`}>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-lg text-[10px] font-black flex items-center justify-center shadow-lg">
                                    {step.id}
                                </div>
                                {step.icon}
                            </div>
                            <h4 className="text-sm font-black text-slate-800 mb-2">{step.title}</h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[200px]">
                                {step.description}
                            </p>
                        </div>

                        {/* Connector arrows for desktop */}
                        {index < steps.length - 1 && (
                            <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-slate-50">
                                <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-slate-100"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProcessGuide;
