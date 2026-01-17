import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api/adminAPI';
import {
    Shield, Users, CheckCircle2, XCircle, LogOut,
    Search, User, Mail, FileCheck, Phone, Lock, Unlock
} from 'lucide-react';

const AdminMain = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('usuarios'); // 'clientes', 'cuidadores', or 'usuarios'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({
        type: 'success', // 'success', 'error', 'confirm'
        title: '',
        message: '',
        onConfirm: null
    });

    // Obtener token
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        loadUsers();
    }, [activeTab, navigate, token]);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            let data = [];
            if (activeTab === 'clientes') {
                data = await adminService.getAllClientes(token);
            } else {
                data = await adminService.getAllCuidadores(token);
            }
            // Asegurar que data sea un array
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error loading users:", err);
            setError("No se pudieron cargar los usuarios. Verifica tu conexión o credenciales.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (id) => {
        setModalData({
            type: 'confirm',
            title: '¿Verificar Usuario?',
            message: '¿Estás seguro de que deseas verificar el documento de este usuario?',
            confirmType: 'success',
            onConfirm: async () => {
                setProcessingId(id);
                try {
                    if (activeTab === 'clientes') {
                        await adminService.verifyCliente(token, id);
                    } else {
                        await adminService.verifyCuidador(token, id);
                    }
                    await loadUsers();
                    setModalData({
                        type: 'success',
                        title: '¡Verificado!',
                        message: 'El documento del usuario ha sido verificado exitosamente.'
                    });
                    setShowModal(true);
                } catch (err) {
                    console.error("Error verifying user:", err);
                    setModalData({
                        type: 'error',
                        title: 'Error',
                        message: `No se pudo verificar el usuario: ${err.message}`
                    });
                    setShowModal(true);
                } finally {
                    setProcessingId(null);
                }
            }
        });
        setShowModal(true);
    };

    const handleUnlock = (userId) => {
        setModalData({
            type: 'confirm',
            title: '¿Desbloquear Cuenta?',
            message: '¿Estás seguro de que deseas desbloquear esta cuenta de usuario?',
            confirmType: 'success',
            onConfirm: async () => {
                setProcessingId(userId);
                try {
                    await adminService.unlockUser(token, userId);
                    await loadUsers();
                    setModalData({
                        type: 'success',
                        title: '¡Desbloqueado!',
                        message: 'La cuenta ha sido desbloqueada exitosamente.'
                    });
                    setShowModal(true);
                } catch (err) {
                    console.error("Error unlocking user:", err);
                    setModalData({
                        type: 'error',
                        title: 'Error',
                        message: `No se pudo desbloquear la cuenta: ${err.message}`
                    });
                    setShowModal(true);
                } finally {
                    setProcessingId(null);
                }
            }
        });
        setShowModal(true);
    };

    const handleLock = (userId) => {
        setModalData({
            type: 'confirm',
            title: '¿Bloquear Cuenta?',
            message: '¿Estás seguro de que deseas bloquear esta cuenta de usuario? El usuario no podrá acceder al sistema.',
            confirmType: 'danger',
            onConfirm: async () => {
                setProcessingId(userId);
                try {
                    await adminService.lockUser(token, userId);
                    await loadUsers();
                    setModalData({
                        type: 'success',
                        title: '¡Bloqueado!',
                        message: 'La cuenta ha sido bloqueada exitosamente.'
                    });
                    setShowModal(true);
                } catch (err) {
                    console.error("Error locking user:", err);
                    setModalData({
                        type: 'error',
                        title: 'Error',
                        message: `No se pudo bloquear la cuenta: ${err.message}`
                    });
                    setShowModal(true);
                } finally {
                    setProcessingId(null);
                }
            }
        });
        setShowModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Filtrar usuarios según la pestaña activa
    // Filtrar usuarios: mostrar si falta verificar O si está bloqueada
    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        // Mostrar si: 
        // 1. El documento NO está verificado
        // 2. O la cuenta ESTÁ bloqueada
        const shouldShow = !u.documentoVerificado || u.cuentaBloqueada;

        if (!shouldShow) return false;

        // Aplicar filtro de búsqueda
        const searchLower = searchTerm.toLowerCase();
        return (
            u.nombreUsuario?.toLowerCase().includes(searchLower) ||
            u.emailUsuario?.toLowerCase().includes(searchLower) ||
            u.documentoIdentidad?.toLowerCase().includes(searchLower)
        );
    }) : [];

    // Modal Component
    const Modal = () => {
        if (!showModal) return null;

        const isConfirm = modalData.type === 'confirm';

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="text-center">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${modalData.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                            modalData.type === 'error' ? 'bg-red-50 text-red-500' :
                                'bg-amber-50 text-amber-500'
                            }`}>
                            {modalData.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> :
                                modalData.type === 'error' ? <XCircle className="w-10 h-10" /> :
                                    <Lock className="w-10 h-10" />}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{modalData.title}</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{modalData.message}</p>

                        {isConfirm ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all transform active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        if (modalData.onConfirm) modalData.onConfirm();
                                    }}
                                    className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-lg ${modalData.confirmType === 'danger'
                                        ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                        }`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowModal(false)}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all transform active:scale-95 shadow-lg ${modalData.type === 'success'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                    : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                    }`}
                            >
                                Continuar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const UserTable = ({ data }) => (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-left">
                            <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Usuario</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Contacto</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((user) => {
                            // ID para mostrar en la tabla (ClienteID o CuidadorID)
                            const displayId = user.clienteID || user.cuidadorID;
                            // ID para acciones de usuario (UsuarioID del Auth Service)
                            // Intentamos user.usuarioID (camelCase) o user.UsuarioID (PascalCase) por si acaso
                            const authUserId = user.usuarioID || user.UsuarioID;

                            return (
                                <tr key={displayId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">
                                        #{displayId}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mr-3">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.nombreUsuario || 'Sin Nombre'}</p>
                                                <p className="text-xs text-slate-400">CI: {user.documentoIdentidad || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-slate-600">
                                                <Mail className="w-3 h-3 mr-2 text-slate-400" />
                                                {user.emailUsuario || 'N/A'}
                                            </div>
                                            <div className="flex items-center text-xs text-slate-600">
                                                <Phone className="w-3 h-3 mr-2 text-slate-400" />
                                                {/* Usamos telefonoUsuario que viene enriquecido, o telefonoEmergencia como fallback */}
                                                {user.telefonoUsuario || user.telefonoEmergencia || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {/* Estado de verificación de documento */}
                                            {!user.documentoVerificado && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Pendiente Verificación
                                                </span>
                                            )}

                                            {/* Estado de cuenta bloqueada */}
                                            {user.cuentaBloqueada && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                    🔒 Cuenta Bloqueada
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            {/* Botón de verificar documento */}
                                            {!user.documentoVerificado && (
                                                <button
                                                    onClick={() => handleVerify(displayId)}
                                                    disabled={processingId === displayId}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {processingId === displayId ? 'Procesando...' : (
                                                        <>
                                                            <FileCheck className="w-3 h-3 mr-2" />
                                                            Validar Documento
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {/* Botones de bloqueo - Usamos authUserId */}
                                            {user.cuentaBloqueada ? (
                                                <button
                                                    onClick={() => handleUnlock(authUserId)}
                                                    disabled={processingId === authUserId}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {processingId === authUserId ? 'Procesando...' : (
                                                        <>
                                                            <Unlock className="w-3 h-3 mr-2" />
                                                            Desbloquear Cuenta
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleLock(authUserId)}
                                                    disabled={processingId === authUserId}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                >
                                                    {processingId === authUserId ? 'Procesando...' : (
                                                        <>
                                                            <Lock className="w-3 h-3 mr-2" />
                                                            Bloquear Cuenta
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="p-8 text-center text-slate-400 font-medium">
                        No se encontraron usuarios {activeTab === 'clientes' ? 'clientes' : 'cuidadores'}.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-slate-900 text-white py-4 px-6 md:px-12 shadow-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src="/petcare-logo.png" alt="PetCare Admin Logo" className="w-full h-full object-contain filter drop-shadow-md" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight">PetCare Admin</h1>
                            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Panel de Control</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-200">Administrador</p>
                            <p className="text-xs text-slate-500">access_level: root</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="py-10 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Gestión de Usuarios</h2>
                        <p className="text-slate-500">Valida y gestiona las cuentas de la plataforma.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('clientes')}
                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${activeTab === 'clientes'
                            ? 'bg-indigo-600 text-white shadow-indigo-200 scale-105'
                            : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                    >
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('cuidadores')}
                        className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg ${activeTab === 'cuidadores'
                            ? 'bg-indigo-600 text-white shadow-indigo-200 scale-105'
                            : 'bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                    >
                        Cuidadores
                    </button>
                </div>

                {error && (
                    <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center">
                        <XCircle className="w-5 h-5 mr-3" />
                        <span className="font-bold text-sm">{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <UserTable data={filteredUsers} />
                )}
            </main>
            <Modal />
        </div>
    );
};

export default AdminMain;
