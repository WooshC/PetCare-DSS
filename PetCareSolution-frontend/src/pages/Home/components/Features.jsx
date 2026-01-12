// pages/Home/components/Features.jsx
import React from 'react';
import { Shield, Clock, Star, MapPin, Heart, Users, BadgeCheck, PawPrint } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: BadgeCheck,
      title: "Cuidadores Verificados",
      description: "Riguroso proceso de validación de identidad para tu total seguridad.",
      color: "bg-emerald-50 text-emerald-600",
      accent: "emerald"
    },
    {
      icon: Clock,
      title: "Disponibilidad 24/7",
      description: "Encuentra apoyo experto en cualquier momento, incluso emergencias nocturnas.",
      color: "bg-brand-50 text-brand-600",
      accent: "brand"
    },
    {
      icon: Star,
      title: "Calidad Garantizada",
      description: "Sistema de reseñas reales basado en servicios completados exitosamente.",
      color: "bg-amber-50 text-amber-600",
      accent: "amber"
    },
    {
      icon: Heart,
      title: "Pasión por los Animales",
      description: "Conectamos con personas que realmente aman y respetan a cada mascota.",
      color: "bg-rose-50 text-rose-600",
      accent: "rose"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Protocolos de seguridad avanzados para proteger tanto a dueños como mascotas.",
      color: "bg-slate-900 text-white",
      accent: "slate"
    }
  ];

  return (
    <section id="features" className="py-32 bg-white relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-6">
              Nuestros Diferenciales
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter leading-none">
              Por qué miles confían <br />
              <span className="text-slate-400">su mejor amigo a PetCare.</span>
            </h2>
          </div>
          <p className="text-lg font-medium text-slate-500 max-w-sm">
            No solo somos una plataforma, somos el puente hacia una comunidad de cuidado experto y apasionado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-200 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
              <div className={`w-16 h-16 ${feature.color} rounded-[1.5rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                "{feature.description}"
              </p>
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-500 transition-colors">
                Saber más →
              </div>
            </div>
          ))}

          {/* Visual Filler / CTA Card */}
          <div className="group p-10 rounded-[3rem] bg-slate-900 border border-slate-900 flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-150 transition-transform duration-700">
              <PawPrint className="w-32 h-32 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 relative z-10 tracking-tight">¿Listo para unirte?</h3>
            <p className="text-white/60 text-sm font-medium mb-8 relative z-10">Crea tu cuenta en menos de 2 minutos.</p>
            <button className="bg-brand-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all relative z-10 shadow-lg shadow-brand-500/20">
              Empezar Registro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;