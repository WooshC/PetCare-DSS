// src/components/common/Footer.jsx
import React from 'react';
import { PawPrint, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-white/5 relative overflow-hidden">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 lg:gap-24">
          {/* Brand Identity */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/Home" className="flex items-center space-x-3 group mb-8">
              <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                <PawPrint className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight block leading-none">PetCare</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">Professional Network</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8 italic">
              "Transformando la vida de las mascotas a través de cuidado experto y apasionado."
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 px-1">Explorar</h3>
            <ul className="space-y-4">
              {['Características', 'Cómo Funciona', 'Preguntas', 'Tarifas'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-sm font-black text-slate-400 hover:text-brand-400 flex items-center group transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500/20 mr-3 group-hover:bg-brand-500 transition-colors"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Info */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 px-1">Soporte Tecnico</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Email Corporativo</p>
                  <p className="text-xs font-bold text-slate-400">petcare@solution.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Línea Directa</p>
                  <p className="text-xs font-bold text-slate-400">0979238583</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="col-span-1">
            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-700">
                <Shield className="w-24 h-24 text-white" />
              </div>
              <div className="flex items-center space-x-2 text-brand-400 mb-4">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">PetCare Secure</span>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                Tus pagos y datos personales están protegidos por encriptación bancaria de alto nivel.
              </p>
              <div className="mt-6 flex items-center space-x-2 text-white/30">
                <Heart className="w-3 h-3 fill-current" />
                <span className="text-[8px] font-black uppercase tracking-widest">Hecho con pasión en Ecuador</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Final Copyright */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
            © 2025 PETCARE SOLUTIONS • ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;