import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout
import MainLayout from './layouts/MainLayout';

// Dashboard pages
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Devices from './pages/Devices';
import Energy from './pages/Energy';
import Security from './pages/Security';
import Automation from './pages/Automation';
import Rapports from './pages/Rapports';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/status')
      .then(res => setStatus(res.data.message))
      .catch(() => setStatus("Error: Backend is not responding"));
  }, []);
  const [notifications, setNotifications] = useState([
  { id: 1, title: "Mouvement Détecté", desc: "Un mouvement a été détecté dans le Salon à 02:30 AM.", type: "danger", isRead: false },
  { id: 2, title: "Optimisation Énergie", desc: "Voulez-vous fermer les rideaux pour réduire la clim de 15%?", type: "routine", isRead: false },
  { id: 3, title: "Porte Ouverte", desc: "La porte principale est restée ouverte plus de 5 minutes.", type: "danger", isRead: true },
  { id: 4, title: "Économie Hebdomadaire", desc: "Votre consommation a baissé de 10%.", type: "eco", isRead: false },
  { id: 5, title: "Système à jour", desc: "Le système ESP32 a été mis à jour avec succès.", type: "normal", isRead: true }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  return (
    <Router>
      <Routes>

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected layout routes */}
        <Route path="/home" element={<MainLayout />}>

          
          <Route index element={<Navigate to="dashboard" replace />} />

          
          <Route path="dashboard" element={<Dashboard unreadCount={unreadCount} />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="devices" element={<Devices />} />
          <Route path="energy" element={<Energy />} />
          <Route path="automation" element={<Automation />} />
          <Route path="security" element={<Security />} />
          <Route path="notifications" element={<Notifications notifications={notifications} markAllRead={markAllRead} />} />
          <Route path="settings" element={<Settings />} />
          <Route path="users" element={<Users />} />
          <Route path="rapports" element={<Rapports />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;