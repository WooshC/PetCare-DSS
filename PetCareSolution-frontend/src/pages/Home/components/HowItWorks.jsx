// pages/Home/components/HowItWorks.jsx
import React from 'react';
import { User, Search, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: User,
      step: "01",
      title: "Crea tu Cuenta",
      description: "Regístrate de forma segura y configura tu perfil detallado.",
      color: "bg-slate-900"
    },
    {
      icon: Search,
      step: "02",
      title: "Busca Expertos",
      description: "Filtra por ubicación, precio y experiencia comprobada.",
      color: "bg-brand-500"
    },
    {
      icon: Calendar,
      step: "03",
      title: "Agenda el Día",
      description: "Selecciona el horario y confirma el servicio al instante.",
      color: "bg-emerald-500"
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Tranquilidad Total",
      description: "Tu mascota recibe el mejor trato mientras tú descansas.",
      color: "bg-slate-900"
    }
  ];

  return (
    <section id="how-it-works" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Text Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-slate-200/20 pointer-events-none select-none">
        STEPS
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-6">
            El Proceso PetCare
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter leading-none mb-6">
            Encuentra el cuidado perfecto <br />
            <span className="text-brand-500">en solo segundos.</span>
          </h2>
          <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
            Hemos simplificado cada paso para que te enfoques en lo que importa: la felicidad de tu mascota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="group relative">
              {/* Connecting Arrow for Desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-12 left-full w-full -ml-8 items-center justify-center -z-10 text-slate-200">
                  <div className="h-0.5 w-12 bg-slate-200"></div>
                  <ArrowRight className="w-5 h-5 -ml-1" />
                </div>
              )}

              <div className="text-center">
                <div className={`w-24 h-24 ${step.color} rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-200 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 relative`}>
                  <step.icon className="w-10 h-10 text-white" />
                  <div className="absolute -top-3 -right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center text-slate-900 text-xs font-black border border-slate-100 shadow-sm">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight group-hover:text-brand-600 transition-colors">
                  {step.title}
                </h3>

                <p className="text-slate-500 font-medium text-sm leading-relaxed px-4 italic">
                  "{step.description}"
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-300 hover:scale-110 active:scale-95">
            Quiero registrarme ahora
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;