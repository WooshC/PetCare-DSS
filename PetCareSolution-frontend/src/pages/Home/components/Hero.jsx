// pages/Home/components/Hero.jsx
import React from 'react';
import { ArrowRight, Play, Star, ShieldCheck, Heart, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center bg-[#F8FAFC] py-32 overflow-hidden">
      {/* Background image (marca de agua) */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-4 blur-sm mix-blend-multiply"
        style={{
          backgroundImage:
            "url('https://imgs.search.brave.com/X9RMzcm4dVZzmQe7iORRk-Clzc55O8VfgQBEpCpdlUI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuY3RmYXNzZXRz/Lm5ldC9iODVvemIy/cTM1OG8vM0MxT0tq/dUx0OGlJY0pnSmZx/dXhqSi8xOWY5ZDY0/MWViNTkyNTRkMGUx/MWVmODlhZjJmNTlh/Yi9wZXJyb19mZWxp/ei5wbmc')",
        }}
      ></div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-brand-100/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100 drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
          Cuidado Experto <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-600">para tu Familiar</span> <br />
          más Peludo.
        </h1>

        <p className="text-lg md:text-2xl font-bold text-slate-800 max-w-3xl mx-auto mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-200 drop-shadow-[0_1px_5px_rgba(255,255,255,0.5)]">
          Transformamos la forma de cuidar mascotas. Conecta con profesionales validados y mantén la tranquilidad total mientras estás fuera.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom-12 duration-700 delay-300">
          <Link to="/register">
            <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-300 hover:scale-110 active:scale-95 flex items-center group">
              Empezar ahora
              <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </Link>

          <button className="flex items-center space-x-4 group px-10 py-5">
            <div className="w-14 h-14 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:shadow-brand-200 transition-all border border-slate-50">
              <Play className="w-5 h-5 text-brand-500 fill-current" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">¿Cómo funciona?</p>
              <p className="text-sm font-black text-slate-800 group-hover:text-brand-600 transition-colors tracking-tight">Ver Demo del Sistema</p>
            </div>
          </button>
        </div>

        {/* Brand Trust */}
        <div className="mt-24 pt-12 border-t border-slate-200/50 flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 animate-in fade-in delay-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
            <span className="font-black tracking-tighter text-xl">TRUSTED</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-slate-900" />
            <span className="font-black tracking-tighter text-xl">SAFECARE</span>
          </div>
          <div className="flex items-center space-x-2">
            <PawPrint className="w-6 h-6 text-slate-900" />
            <span className="font-black tracking-tighter text-xl">PETPROS</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
