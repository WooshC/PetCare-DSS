// components/RoleSwitcher.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

const RoleSwitcher = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentRole = user.currentRole || user.role;

  const handleRoleSwitch = (newRole) => {
    const updatedUser = {
      ...user,
      currentRole: newRole
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Redirigir al dashboard correspondiente
    const targetPath = getDashboardPath(newRole);
    navigate(targetPath, { replace: true });
    window.location.reload(); // Forzar actualización del contexto
  };

  const getDashboardPath = (role) => {
    const normalizedRole = role?.toLowerCase();
    switch (normalizedRole) {
      case 'cuidador': return '/cuidador/dashboard';
      case 'cliente': return '/cliente/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/dashboard';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role?.toLowerCase()) {
      case 'cuidador': return '👤 Cuidador';
      case 'cliente': return '❤️ Cliente';
      case 'admin': return '⚙️ Admin';
      default: return role;
    }
  };

  if (!user.availableRoles || user.availableRoles.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Cambiar de Rol</h3>
        <RefreshCw className="h-4 w-4 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Actualmente actúas como: <strong>{getRoleDisplayName(currentRole)}</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {user.availableRoles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              currentRole === role
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-gray-300'
            }`}
          >
            {getRoleDisplayName(role)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSwitcher;