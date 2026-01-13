// pages/Auth/components/RegisterForm.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, User, Mail, Lock, PawPrint, FileText, Phone,
  Clock, DollarSign, Smartphone, CheckCircle2, XCircle, AlertCircle, Heart, Shield, Layout
} from 'lucide-react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { authService } from '../../../services/api/authAPI';
import { clientService } from '../../../services/api/clientAPI';
import { caregiverService } from '../../../services/api/caregiverAPI';

// Schema de validación
const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phoneNumber: z.string().min(10, 'Mínimo 10 caracteres').max(15, 'Máximo 15 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mayúsculas, minúsculas y números'),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  role: z.enum(['Cliente', 'Cuidador'], { required_error: 'Selecciona un perfil' }),
  documentoIdentidad: z.string().min(1, 'Requerido'),
  telefonoEmergencia: z.string().min(1, 'Requerido'),
  biografia: z.string().optional(),
  experiencia: z.string().optional(),
  horarioAtencion: z.string().optional(),
  tarifaPorHora: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
}).refine((data) => data.role !== 'Cuidador' || data.biografia?.trim().length > 0, { 
  message: 'Biografía requerida', 
  path: ['biografia'] 
}).refine((data) => data.role !== 'Cuidador' || data.experiencia?.trim().length > 0, { 
  message: 'Experiencia requerida', 
  path: ['experiencia'] 
}).refine((data) => data.role !== 'Cuidador' || data.horarioAtencion?.trim().length > 0, { 
  message: 'Horario requerido', 
  path: ['horarioAtencion'] 
}).refine((data) => data.role !== 'Cuidador' || (data.tarifaPorHora && parseFloat(data.tarifaPorHora) > 0), { 
  message: 'Tarifa mayor a 0', 
  path: ['tarifaPorHora'] 
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', description: '', type: 'success' });
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors }, setValue, trigger } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    console.log('🚀 [RegisterForm] Iniciando registro...');
    console.log('📋 [RegisterForm] Rol seleccionado:', data.role);

    try {
      // PASO 1: Registrar usuario en el sistema de autenticación
      console.log('1️⃣ [RegisterForm] Registrando usuario base...');
      
      // ✅ CRÍTICO: authService.register() espera propiedades en MINÚSCULA
      // porque internamente las convierte a MAYÚSCULA para el backend
      const authPayload = {
        email: data.email,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber,
        role: data.role
      };

      console.log('📤 [RegisterForm] Enviando:', { ...authPayload, password: '***' });
      console.log('📧 Email:', data.email);
      console.log('👤 Nombre:', data.name);
      console.log('📱 Teléfono:', data.phoneNumber);
      console.log('🎭 Rol:', data.role);

      const authResult = await authService.register(authPayload);
      
      console.log('✅ [RegisterForm] Usuario base creado:', authResult);

      if (!authResult.success) {
        throw new Error(authResult.error || 'Error en el registro de usuario');
      }

      // El token ya está guardado en localStorage por authService.register
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No se obtuvo token de autenticación');
      }

      // PASO 2: Crear el perfil específico (Cliente o Cuidador)
      console.log('2️⃣ [RegisterForm] Creando perfil de', data.role);

      const profileData = {
        documentoIdentidad: data.documentoIdentidad,
        telefonoEmergencia: data.telefonoEmergencia
      };

      // Si es cuidador, agregar campos adicionales
      if (data.role === 'Cuidador') {
        profileData.biografia = data.biografia;
        profileData.experiencia = data.experiencia;
        profileData.horarioAtencion = data.horarioAtencion;
        profileData.tarifaPorHora = parseFloat(data.tarifaPorHora);
      }

      console.log('📤 [RegisterForm] Payload de perfil:', profileData);

      // Seleccionar el servicio correcto
      const service = data.role === 'Cliente' ? clientService : caregiverService;
      
      try {
        await service.createProfile(profileData);
        console.log('✅ [RegisterForm] Perfil creado exitosamente');
      } catch (profileError) {
        console.error('⚠️ [RegisterForm] Error al crear perfil:', profileError.message);
        console.warn('Usuario creado pero sin perfil completo');
      }

      // Mostrar modal de éxito
      setModal({ 
        isOpen: true, 
        title: '¡Bienvenido!', 
        description: `Tu cuenta de ${data.role} ha sido creada exitosamente.`, 
        type: 'success' 
      });

    } catch (error) {
      console.error('❌ [RegisterForm] Error en el registro:', error);
      
      let errorMessage = error.message;
      
      // Mejorar mensajes de error comunes
      if (errorMessage.includes('Email')) {
        errorMessage = 'Este correo electrónico ya está registrado';
      } else if (errorMessage.includes('Password')) {
        errorMessage = 'La contraseña no cumple con los requisitos';
      }
      
      setModal({ 
        isOpen: true, 
        title: 'Error en el registro', 
        description: errorMessage, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden mb-8">
      <div className="bg-slate-900 px-8 py-4 flex items-center space-x-3">
        <Icon className="h-4 w-4 text-brand-400" />
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-8 space-y-6">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden px-4 py-16">
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand-200/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="text-center mb-12">
          <Link to="/Home" className="inline-flex items-center space-x-3 group mb-6">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-xl transform group-hover:-rotate-12 transition-transform">
              <PawPrint className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-slate-800 tracking-tight block">PetCare</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Join our Community</span>
            </div>
          </Link>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Crea tu Cuenta</h2>
          <p className="text-slate-500 font-medium mt-2">Empieza hoy mismo a cuidar o encontrar cuidado experto</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          <FormSection title="Elige tu Perfil" icon={Layout}>
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => { setValue('role', 'Cliente'); trigger('role'); }}
                className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center group relative ${
                  selectedRole === 'Cliente' 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100' 
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                  selectedRole === 'Cliente' 
                    ? 'bg-emerald-500 text-white scale-110' 
                    : 'bg-white text-slate-400'
                }`}>
                  <Heart className="w-8 h-8" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${
                  selectedRole === 'Cliente' ? 'text-emerald-600' : 'text-slate-400'
                }`}>Cliente</span>
                <p className="text-[10px] text-slate-400 mt-2 font-bold text-center">Busco cuidado para mi mascota</p>
              </button>

              <button
                type="button"
                onClick={() => { setValue('role', 'Cuidador'); trigger('role'); }}
                className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center group relative ${
                  selectedRole === 'Cuidador' 
                    ? 'border-brand-500 bg-brand-50/50 shadow-lg shadow-brand-100' 
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                  selectedRole === 'Cuidador' 
                    ? 'bg-brand-500 text-white scale-110' 
                    : 'bg-white text-slate-400'
                }`}>
                  <PawPrint className="w-8 h-8" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${
                  selectedRole === 'Cuidador' ? 'text-brand-600' : 'text-slate-400'
                }`}>Cuidador</span>
                <p className="text-[10px] text-slate-400 mt-2 font-bold text-center">Quiero ofrecer mis servicios</p>
              </button>
            </div>
            {errors.role && <p className="text-center text-red-500 text-[10px] font-black uppercase">{errors.role.message}</p>}
          </FormSection>

          <FormSection title="Información Personal" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nombre" 
                {...register('name')} 
                error={errors.name?.message} 
                placeholder="Tu nombre" 
                icon={<User className="w-4 h-4 text-slate-400" />} 
                className="rounded-2xl bg-slate-50" 
              />
              <Input 
                label="Email" 
                {...register('email')} 
                error={errors.email?.message} 
                placeholder="tu@email.com" 
                icon={<Mail className="w-4 h-4 text-slate-400" />} 
                className="rounded-2xl bg-slate-50" 
              />
              <Input 
                label="Cédula/RUC" 
                {...register('documentoIdentidad')} 
                error={errors.documentoIdentidad?.message} 
                placeholder="Documento" 
                icon={<FileText className="w-4 h-4 text-slate-400" />} 
                className="rounded-2xl bg-slate-50" 
              />
              <Input 
                label="Celular" 
                {...register('phoneNumber')} 
                error={errors.phoneNumber?.message} 
                placeholder="+593" 
                icon={<Smartphone className="w-4 h-4 text-slate-400" />} 
                className="rounded-2xl bg-slate-50" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="relative">
                <Input 
                  label="Contraseña" 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')} 
                  error={errors.password?.message} 
                  placeholder="••••••••" 
                  icon={<Lock className="w-4 h-4 text-slate-400" />} 
                  className="rounded-2xl bg-slate-50" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-[2.4rem] text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input 
                label="Repetir Contraseña" 
                type="password" 
                {...register('confirmPassword')} 
                error={errors.confirmPassword?.message} 
                placeholder="••••••••" 
                icon={<Lock className="w-4 h-4 text-slate-400" />} 
                className="rounded-2xl bg-slate-50" 
              />
            </div>
          </FormSection>

          {selectedRole === 'Cuidador' && (
            <FormSection title="Perfil Profesional" icon={Shield}>
              <div className="space-y-6">
                <Input 
                  label="Biografía Profesional" 
                  {...register('biografia')} 
                  error={errors.biografia?.message} 
                  placeholder="Cuéntanos sobre ti..." 
                  multiline 
                  rows={3} 
                  className="rounded-2xl bg-slate-50" 
                />
                <Input 
                  label="Detalle de Experiencia" 
                  {...register('experiencia')} 
                  error={errors.experiencia?.message} 
                  placeholder="Años, certificaciones, especialidades..." 
                  multiline 
                  rows={3} 
                  className="rounded-2xl bg-slate-50" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Horario" 
                    {...register('horarioAtencion')} 
                    error={errors.horarioAtencion?.message} 
                    placeholder="L-V 8am-6pm" 
                    icon={<Clock className="w-4 h-4 text-slate-400" />} 
                    className="rounded-2xl bg-slate-50" 
                  />
                  <Input 
                    label="Tarifa ($/hr)" 
                    type="number" 
                    step="0.01"
                    {...register('tarifaPorHora')} 
                    error={errors.tarifaPorHora?.message} 
                    placeholder="0.00" 
                    icon={<DollarSign className="w-4 h-4 text-slate-400" />} 
                    className="rounded-2xl bg-slate-50" 
                  />
                </div>
              </div>
            </FormSection>
          )}

          <FormSection title="Contacto de Respaldo" icon={Phone}>
            <Input 
              label="Teléfono de Emergencia" 
              {...register('telefonoEmergencia')} 
              error={errors.telefonoEmergencia?.message} 
              placeholder="Un número de contacto extra" 
              icon={<Phone className="w-4 h-4 text-slate-400" />} 
              className="rounded-2xl bg-slate-50" 
            />
          </FormSection>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-2xl shadow-slate-200">
            <p className="text-white/60 text-xs font-medium mb-6 px-10">
              Al hacer clic en registrarte, confirmas que aceptas nuestros{' '}
              <span className="text-white font-bold">Términos de Servicio</span> y{' '}
              <span className="text-white font-bold">Privacidad</span>.
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                isLoading 
                  ? 'bg-slate-700' 
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20'
              }`}
            >
              {isLoading ? 'Creando tu Espacio...' : `Registrarme como ${selectedRole || 'Elegir'}`}
            </Button>
            <p className="text-white/80 text-sm font-medium mt-8">
              ¿Ya eres parte?{' '}
              <Link to="/login" className="text-emerald-400 hover:underline font-black">
                Inicia Sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center border border-slate-100 animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${
              modal.type === 'success' 
                ? 'bg-emerald-50 text-emerald-500' 
                : 'bg-red-50 text-red-500'
            }`}>
              {modal.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{modal.title}</h3>
            <p className="text-slate-500 font-medium mb-8">{modal.description}</p>
            <button
              onClick={() => { 
                setModal({ ...modal, isOpen: false }); 
                if (modal.type === 'success') navigate('/login'); 
              }}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-lg ${
                modal.type === 'success' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;