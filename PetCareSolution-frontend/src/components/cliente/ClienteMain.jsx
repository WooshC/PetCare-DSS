// src/components/cliente/ClienteMain.jsx
import React, { useState, useEffect } from 'react';
import ClienteHeader from '../layout/ClienteHeader';
import ClientePerfil from './ClientePerfil';
// import MascotasSection from './MascotasSection';
import SolicitudesSection from './SolicitudesSection';
import HistorialSection from './HistorialSection';
import { useClienteSolicitudes } from '../../hooks/useClienteSolicitudes';

const ClienteMain = ({ onLogout }) => {
  const [currentSection, setCurrentSection] = useState('perfil');
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  // Usar el hook para obtener datos reales de solicitudes
  const { totalPendientes, totalFinalizadas } = useClienteSolicitudes();

  // Obtener usuario del localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Cargar perfil del cliente (datos temporales)
  useEffect(() => {
    const loadClienteProfile = async () => {
      try {
        // Simular carga de datos del cliente
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Datos temporales - cuando tengas el servicio real, reemplaza esto
        const profileData = {
          nombreUsuario: user.name || 'Cliente',
          emailUsuario: user.email || 'usuario@example.com',
          documentoIdentidad: '1234567890',
          telefonoEmergencia: '+593 987654321',
          documentoVerificado: true,
          fechaCreacion: new Date().toISOString()
        };

        setCliente(profileData);
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClienteProfile();
  }, [user.name, user.email]);

  // Función para editar perfil
  const handleEditProfile = () => {
    // Aquí puedes implementar la lógica de edición
    console.log('Abrir edición de perfil');
  };

  // Función para logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  // Renderizar sección actual
  const renderSection = () => {
    if (loading && currentSection === 'perfil') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Cargando perfil...</span>
        </div>
      );
    }

    switch (currentSection) {
      case 'perfil':
        return (
          <ClientePerfil
            onLogout={handleLogout}
            onEditProfile={handleEditProfile}
          />
        );
      case 'solicitudes':
        return (
          <SolicitudesSection />
        );
      case 'historial':
        return <HistorialSection />;
      default:
        return (
          <ClientePerfil
            onLogout={handleLogout}
            onEditProfile={handleEditProfile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ClienteHeader
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        onLogout={handleLogout}
        clienteName={user.name || 'Cliente'}
        solicitudesCount={totalPendientes}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default ClienteMain;