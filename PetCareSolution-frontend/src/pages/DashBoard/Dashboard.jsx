// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CuidadorMain from '../../components/cuidador/CuidadorMain';
import ClienteDashboard from '../../components/cliente/ClienteMain';
import DefaultDashboard from '../../components/dashboard/DefaultDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  console.log('🔍 Dashboard - Usuario:', user);
  console.log('🔍 Dashboard - Rol:', user?.role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Si no hay token, redirigir al login
  if (!token) {
    navigate('/login');
    return null;
  }

  // Renderizar dashboard según el rol del usuario
  const renderDashboardByRole = () => {
    const userRole = user?.role?.toLowerCase();

    console.log('🎯 Renderizando dashboard para rol:', userRole);

    switch (userRole) {
      case 'cuidador':
        console.log('✅ Usando CuidadorMain');
        return <CuidadorMain onLogout={handleLogout} />;
      case 'cliente':
        console.log('✅ Usando ClienteDashboard');
        return <ClienteDashboard onLogout={handleLogout} />;
      default:
        console.log('✅ Usando DefaultDashboard');
        return <DefaultDashboard onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;