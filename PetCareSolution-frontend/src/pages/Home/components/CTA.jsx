// pages/Home/components/CTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Shield } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-slate-900 rounded-[3.5rem] overflow-hidden p-12 md:p-24 text-center group shadow-2xl shadow-slate-300">
          {/* Background Animations */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-brand-600/20 to-transparent -skew-x-12 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-[50%] h-full bg-gradient-to-r from-emerald-600/20 to-transparent -skew-x-12 -translate-x-1/2 group-hover:-translate-x-1/3 transition-transform duration-1000"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Únete a la Revolución del Cuidado</span>
            </div>

            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8">
              Tu mascota merece <br />
              <span className="text-brand-400">lo mejor de nosotros.</span>
            </h2>

            <p className="text-lg md:text-xl font-medium text-white/50 mb-12 max-w-xl mx-auto leading-relaxed italic">
              "Descubre la tranquilidad de saber que tu mejor amigo está en manos de profesionales que lo aman tanto como tú."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-brand-400 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 flex items-center justify-center group">
                  Empezar ahora
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>

              <div className="flex items-center space-x-8 text-white/40">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sin costos de registro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">100% Seguro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Icon */}
          <div className="absolute -bottom-10 -right-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            <Sparkles className="w-64 h-64 text-white" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;