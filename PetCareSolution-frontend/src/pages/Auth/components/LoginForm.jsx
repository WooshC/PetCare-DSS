// pages/Auth/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, CheckCircle2, XCircle, User, Heart, PawPrint } from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { authService } from '../../../services/api/authAPI';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const session = await authService.validateExistingSession();
        if (session.isValid && session.user) {
          const roleFromState = location.state?.role;
          const targetRole = roleFromState || session.user.role;
          const targetPath = getDashboardPath(targetRole);
          navigate(targetPath, { replace: true });
        }
      } catch (error) { }
    };
    checkExistingSession();
  }, [navigate, location]);

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'cuidador': return '/cuidador/dashboard';
      case 'cliente': return '/cliente/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/dashboard';
    }
  };

  const Modal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${modalData.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
              {modalData.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{modalData.title}</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">{modalData.message}</p>
            <button
              onClick={() => {
                setShowModal(false);
                if (modalData.type === 'success') navigate(getDashboardPath(selectedRole), { replace: true });
              }}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-lg ${modalData.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'email') val = value.toLowerCase().trim();
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El email no es válido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (!selectedRole) newErrors.role = 'Selecciona un tipo de acceso';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await authService.login({ email: formData.email, password: formData.password, identificadorArrendador: 'petcare-ecuador' });
      if (!result.success) throw new Error(result.message || 'Error en la autenticación');
      const user = { ...result.user, currentRole: selectedRole };
      localStorage.setItem('user', JSON.stringify(user));
      setModalData({ type: 'success', title: '¡Bienvenido!', message: `Hola ${result.user?.name}. Accediendo como ${selectedRole === 'cuidador' ? 'Cuidador' : 'Cliente'}.` });
      setShowModal(true);
    } catch (error) {
      setModalData({ type: 'error', title: 'Error de Acceso', message: error.message });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Decorative Bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/Home" className="inline-flex items-center space-x-3 group">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl transform group-hover:rotate-12 transition-transform duration-300">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-800 tracking-tight block leading-none">PetCare</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Access</span>
            </div>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-20"></div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Acceso Seguro</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="ejemplo@petcare.com"
                  icon={<Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
                  className="bg-slate-50/50 border-slate-100 rounded-2xl"
                />
              </div>

              <div className="relative group">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  icon={<Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
                  className="bg-slate-50/50 border-slate-100 rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[2.4rem] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex justify-between items-center">
                <span>Acceder como</span>
                {errors.role && <span className="text-red-500 animate-pulse">Requerido</span>}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('cuidador')}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center group relative overflow-hidden ${selectedRole === 'cuidador'
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100/50'
                    : 'border-slate-100 bg-slate-50/30 hover:border-slate-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${selectedRole === 'cuidador' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                    <PawPrint className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedRole === 'cuidador' ? 'text-indigo-600' : 'text-slate-400'}`}>Cuidador</span>
                  {selectedRole === 'cuidador' && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></div>}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('cliente')}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center group relative overflow-hidden ${selectedRole === 'cliente'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100/50'
                    : 'border-slate-100 bg-slate-50/30 hover:border-slate-200'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${selectedRole === 'cliente' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${selectedRole === 'cliente' ? 'text-emerald-600' : 'text-slate-400'}`}>Cliente</span>
                  {selectedRole === 'cliente' && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></div>}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`w-full mt-4 p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 group relative overflow-hidden ${selectedRole === 'admin'
                  ? 'border-slate-800 bg-slate-50 shadow-lg'
                  : 'border-slate-100 bg-slate-50/30 hover:border-slate-200'
                  }`}
              >
                <Shield className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-slate-900' : 'text-slate-400'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${selectedRole === 'admin' ? 'text-slate-900' : 'text-slate-400'}`}>Administrador</span>
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isLoading ? 'bg-slate-300' : 'bg-slate-900 hover:bg-black shadow-slate-200'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Verificando</div>
              ) : (
                <div className="flex items-center justify-center"><Shield className="h-4 w-4 mr-2" />Ingresar a mi Cuenta</div>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-slate-500 text-sm font-medium">
                ¿Nuevo en PetCare?{' '}
                <Link to="/register" className="text-indigo-600 hover:underline font-black">Crea tu cuenta gratis</Link>
              </p>
            </div>
          </form>
        </div>
      </div >
      <Modal />
    </div >
  );
};

export default LoginForm;