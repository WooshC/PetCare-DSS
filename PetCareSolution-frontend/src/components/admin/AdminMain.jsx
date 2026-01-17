import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api/adminAPI';
import {
    Shield, Users, CheckCircle2, XCircle, LogOut,
    Search, User, Mail, FileCheck, Phone
} from 'lucide-react';

const AdminMain = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clientes'); // 'clientes' or 'cuidadores'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

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
            setUsers(data || []);
        } catch (err) {
            console.error("Error loading users:", err);
            setError("No se pudieron cargar los usuarios. Verifica tu conexión o credenciales.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        if (!window.confirm("¿Seguro que deseas verificar este usuario?")) return;

        setProcessingId(id);
        try {
            if (activeTab === 'clientes') {
                await adminService.verifyCliente(token, id);
            } else {
                await adminService.verifyCuidador(token, id);
            }
            // Recargar lista
            await loadUsers();
            alert("Usuario verificado exitosamente");
        } catch (err) {
            console.error("Error verifying user:", err);
            alert("Error al verificar usuario: " + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const filteredUsers = users.filter(u =>
        u.nombreUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.emailUsuario?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        {data.map((user) => (
                            <tr key={user.clienteID || user.cuidadorID} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-slate-500">
                                    #{user.clienteID || user.cuidadorID}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mr-3">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.nombreUsuario}</p>
                                            <p className="text-xs text-slate-400">CI: {user.documentoIdentidad || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs text-slate-600">
                                            <Mail className="w-3 h-3 mr-2 text-slate-400" />
                                            {user.emailUsuario}
                                        </div>
                                        <div className="flex items-center text-xs text-slate-600">
                                            <Phone className="w-3 h-3 mr-2 text-slate-400" />
                                            {user.telefonoEmergencia || user.telefono || 'N/A'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.documentoVerificado ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Verificado
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Pendiente
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {!user.documentoVerificado && (
                                        <button
                                            onClick={() => handleVerify(user.clienteID || user.cuidadorID)}
                                            disabled={processingId === (user.clienteID || user.cuidadorID)}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {processingId === (user.clienteID || user.cuidadorID) ? 'Procesando...' : (
                                                <>
                                                    <FileCheck className="w-3 h-3 mr-2" />
                                                    Validar
                                                </>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
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
                        <div className="p-2 bg-indigo-500 rounded-xl">
                            <Shield className="w-6 h-6 text-white" />
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
        </div>
    );
};

export default AdminMain;
