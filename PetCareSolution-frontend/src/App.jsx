import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CuidadorMain from './components/cuidador/CuidadorMain';
import './index.css';
import ClienteMain from './components/cliente/ClienteMain';
import PaymentSummary from './components/cliente/PaymentSummary';
import PaymentSuccess from './components/cliente/PaymentSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirección automática de / a /Home */}
          <Route path="/" element={<Navigate to="/Home" replace />} />

          {/* Ruta principal en /Home */}
          <Route path="/Home" element={<Home />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas de Dashboard - Genérica y específicas por rol */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cuidador/dashboard" element={<CuidadorMain />} />
          <Route path="/cliente/dashboard" element={<ClienteMain />} />

          {/* Ruta de pago */}
          <Route path="/cliente/pago/:solicitudId" element={<PaymentSummary />} />
          <Route path="/cliente/pago-exitoso" element={<PaymentSuccess />} />

          {/* Ruta de fallback - redirige a /Home */}
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;