// src/components/common/Header.jsx
import React, { useState, useEffect } from 'react';
import { PawPrint, Menu, X, Shield, Layout, Settings, LogOut, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Características', id: 'features' },
    { name: 'Cómo Funciona', id: 'how-it-works' },
    { name: 'FAQ', id: 'faq' }
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3' : 'py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`transition-all duration-500 rounded-[2rem] border border-white/50 backdrop-blur-xl flex items-center justify-between px-8 h-12 flex h-20 shadow-2xl ${isScrolled ? 'bg-white/80 shadow-slate-200/50' : 'bg-transparent'
          }`}>
          {/* Logo */}
          <Link to="/Home" className="flex items-center space-x-3 group">
            <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl transform group-hover:-rotate-12 transition-transform duration-300">
              <PawPrint className="h-6 w-6 text-brand-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">PetCare</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">Official Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/login">
              <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                Ingresar
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 hover:scale-105 active:scale-95">
                Unirme ahora
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[-1] bg-slate-900/95 backdrop-blur-xl md:hidden transition-all duration-500 flex flex-col justify-center items-center p-10 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}>
        <div className="flex flex-col space-y-6 text-center w-full">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScrollTo(link.id)}
              className="text-2xl font-black text-white uppercase tracking-tighter hover:text-brand-400 transition-all"
            >
              {link.name}
            </button>
          ))}
          <div className="pt-10 flex flex-col space-y-4">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full py-5 rounded-3xl bg-white/10 text-white font-black uppercase tracking-widest text-sm border border-white/10 outline-none">
                Iniciar Sesión
              </button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <button className="w-full py-5 rounded-3xl bg-brand-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-brand-500/20 active:scale-95 outline-none">
                Registrarse
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;