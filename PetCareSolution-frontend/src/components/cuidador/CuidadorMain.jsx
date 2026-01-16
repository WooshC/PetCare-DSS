// src/components/cuidador/CuidadorMain.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CuidadorHeader from '../layout/CuidadorHeader';
import CuidadorPerfil from '../cuidador/CuidadorPerfil';
import SolicitudesSection from './SolicitudesSection';
import SolicitudesActivasSection from './SolicitudesActivasSection';
import HistorialSection from './HistorialSection';
import { useAuth } from '../../hooks/useAuth';
import { useCuidador } from '../../hooks/useCuidador';
import { cuidadorSolicitudService } from '../../services/api/cuidadorSolicitudAPI';

const CuidadorMain = () => {
    const [currentSection, setCurrentSection] = useState('perfil');
    const [asignadasCount, setAsignadasCount] = useState(0);
    const [activasCount, setActivasCount] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loadingCounters, setLoadingCounters] = useState(true);

    const navigate = useNavigate();
    const { user: authUser, loading: authLoading, logout } = useAuth();
    const token = localStorage.getItem('token');
    const { cuidador, loading: cuidadorLoading, error, refetch } = useCuidador(token);

    const loading = authLoading || cuidadorLoading;

    // 🚀 CORRECCIÓN: Cargar contadores reales desde la API
    const loadCounters = async () => {
        try {
            setLoadingCounters(true);

            // Cargar todas las solicitudes para contar
            const todasSolicitudes = await cuidadorSolicitudService.getMisSolicitudes();

            // Contar solicitudes asignadas (Pendiente)
            const asignadas = todasSolicitudes.filter(s => s.estado === 'Pendiente').length;

            // Contar solicitudes activas (Aceptada, En Progreso, Fuera de Tiempo)
            const activas = todasSolicitudes.filter(s =>
                ['Aceptada', 'En Progreso', 'Fuera de Tiempo'].includes(s.estado)
            ).length;

            setAsignadasCount(asignadas);
            setActivasCount(activas);
        } catch (error) {
            console.error('Error cargando contadores:', error);
            // Valores por defecto en caso de error
            setAsignadasCount(0);
            setActivasCount(0);
        } finally {
            setLoadingCounters(false);
        }
    };

    useEffect(() => {
        // Carga inicial
        loadCounters();

        // Polling cada 30 segundos para actualización dinámica
        const intervalId = setInterval(() => {
            loadCounters();
        }, 30000); // 30 segundos

        return () => clearInterval(intervalId);
    }, [refreshTrigger]);

    const handleEditProfile = () => {
        // Abrir edición de perfil
    };

    const handleProfileUpdate = () => {
        refetch();
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // 🚀 CORRECCIÓN: Función para forzar actualización de contadores
    const handleRefreshCounters = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAsignadasCountChange = (count) => {
        setAsignadasCount(count);
    };

    const handleActivasCountChange = (count) => {
        setActivasCount(count);
    };

    // Renderizar sección actual
    const renderSection = () => {
        switch (currentSection) {
            case 'perfil':
                return (
                    <CuidadorPerfil
                        authUser={authUser}
                        cuidador={cuidador}
                        loading={loading}
                        error={error}
                        onEditProfile={handleEditProfile}
                        onProfileUpdate={handleProfileUpdate}
                    />
                );
            case 'solicitudes':
                return (
                    <SolicitudesSection
                        authUser={authUser}
                        cuidador={cuidador}
                        onSolicitudesCountChange={handleAsignadasCountChange}
                        onActionSuccess={handleRefreshCounters}
                    />
                );
            case 'solicitudes-activas':
                return (
                    <SolicitudesActivasSection
                        authUser={authUser}
                        cuidador={cuidador}
                        onSolicitudesCountChange={handleActivasCountChange}
                        onActionSuccess={handleRefreshCounters} // 🚀 Actualizar contadores después de acciones
                    />
                );
            case 'historial':
                return <HistorialSection authUser={authUser} cuidador={cuidador} />;
            default:
                return (
                    <CuidadorPerfil
                        authUser={authUser}
                        cuidador={cuidador}
                        loading={loading}
                        error={error}
                        onEditProfile={handleEditProfile}
                        onProfileUpdate={handleProfileUpdate}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <CuidadorHeader
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                onLogout={handleLogout}
                cuidadorName={authUser?.name || 'Cuidador'}
                solicitudesAsignadasCount={asignadasCount}
                solicitudesActivasCount={activasCount}
                refreshTrigger={refreshTrigger}
            />

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {renderSection()}
            </main>
        </div>
    );
};

export default CuidadorMain;