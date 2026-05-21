import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

// Importation des Assets (Images)
import livingRoomImg from '../assets/livingrom.jpeg';
import user1 from '../assets/profile1.jfif';
import climatiseurImg from '../assets/climatiseur-removebg-preview.png';
import lockImg from '../assets/sereure-removebg-preview.png';
import lightImg from '../assets/lumiére-removebg-preview.png';
import vacImg from '../assets/asp-removebg-preview.png';

// Importation des Composants personnalisés
import ClimateCard from '../components/DashboardDevices/ClimateCard';
import EnergyChart from '../components/DashboardDevices/EnergyChart';
import LightCard from '../components/DashboardDevices/LightCard';
import LockCard from '../components/DashboardDevices/LockCard';
import VacuumCard from '../components/DashboardDevices/VacuumCard';
import VoiceControlButton from '../components/VoiceControlButton';

// Importation des Icônes
import { Thermometer, Sun, Zap, Droplets, Bell } from 'lucide-react';

export default function Dashboard({ unreadCount }) {
  // États pour le contrôle des appareils (On/Off)
  const [acOn, setAcOn] = useState(true);
  const [lightOn, setLightOn] = useState(true);
  const [vacOn, setVacOn] = useState(true);
  const [locked, setLocked] = useState(true);
  
  // États pour les valeurs spécifiques (Intensité, Onglet actif)
  const [lightVal, setLightVal] = useState(36);
  const [activeTab, setActiveTab] = useState('Mois');
  
  const navigate = useNavigate(); 

  // État pour les informations de l'utilisateur connecté
  const [currentUser, setCurrentUser] = useState({ nom: '', prenom: '', photo: user1 });

  // Effet pour récupérer les données du profil utilisateur depuis l'API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setCurrentUser({
            nom: res.data.nom || '',
            prenom: res.data.prenom || '',
            photo: res.data.photo || user1
          });
        }
      } catch (err) {
        // Fallback : récupérer les données depuis le localStorage en cas d'erreur API
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser({
            nom: parsed.nom || '',
            prenom: parsed.prenom || '',
            photo: parsed.photo || user1
          });
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  // Données pour le graphique d'énergie (Consommation)
  const dataMap = {
    Jour: { labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], heights: [40, 65, 30, 85, 45, 90, 55] },
    Mois: { labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'], heights: [38, 55, 42, 70, 60, 35, 75, 92, 55, 62, 48, 80] },
    Années: { labels: ['2021', '2022', '2023', '2024', '2025', '2026'], heights: [60, 40, 80, 50, 95, 70] }
  };

  const currentData = dataMap[activeTab];

  return (
    <div style={{
      background: '#f0f2f5', minHeight: '100vh', padding: 'clamp(12px, 2vw, 20px)',
      display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 16px)',
      fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
    }}>

      {/* SECTION : EN-TÊTE (Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            Bienvenue {currentUser.prenom || 'Utilisateur'}
          </h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>
            Gérez votre maison intelligente facilement.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Icône Notifications */}
          <div onClick={() => navigate('/home/Notifications')} style={{ background: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <Bell size={20} color="#1a1a2e" />
            {unreadCount > 0 && <div style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white' }}>{unreadCount}</div>}
          </div>
          
          {/* Profil Utilisateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <img src={currentUser.photo} alt="user" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
             <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{currentUser.prenom} {currentUser.nom?.charAt(0)}.</span>
          </div>
        </div>
      </div>

      {/* SECTION : BARRES DE STATISTIQUES RAPIDES */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', flex: 1 }}>
          {[
            { label: 'Temp. intérieure', value: '24°C', icon: <Thermometer size={16} color="#9ca3af" /> },
            { label: 'Temp. extérieure', value: '18°C', icon: <Sun size={16} color="#9ca3af" /> },
            { label: 'Energie consommée', value: '13 kwh', icon: <Zap size={16} color="#9ca3af" /> },
            { label: 'Humidité', value: '75%', icon: <Droplets size={16} color="#9ca3af" /> },
            { label: 'Energie solaire', value: '78 kwh', icon: <Sun size={16} color="#9ca3af" /> }
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 4px 0' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{s.icon}<span style={{ fontSize: '16px', fontWeight: 700 }}>{s.value}</span></div>
            </div>
          ))}
        </div>
        <VoiceControlButton />
      </div>

      {/* STYLES CSS LOCAUX (Animations et Responsivité) */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } } 
        .live-dot { animation: pulse 1.2s infinite; } 
        @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr 1fr !important; } } 
        @media (max-width: 600px) { .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* GRILLE PRINCIPALE (Composants et Graphique) */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
        
        {/* Colonne 1 : Aperçu Caméra (Live) et Graphique d'énergie */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <img src={livingRoomImg} alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, background: '#ef4444', color: 'white', fontSize: 11, padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="live-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /> LIVE
            </div>
          </div>
          <EnergyChart activeTab={activeTab} setActiveTab={setActiveTab} currentData={currentData} />
        </div>

        {/* Colonne 2 : Contrôle Climatisation et Lumières */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ClimateCard isOn={acOn} onToggle={() => setAcOn(!acOn)} img={climatiseurImg} />
          <LightCard isOn={lightOn} onToggle={() => setLightOn(!lightOn)} val={lightVal} setVal={setLightVal} img={lightImg} />
        </div>

        {/* Colonne 3 : Sécurité (Verrous) et Aspirateur Robot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <LockCard isLocked={locked} onToggle={setLocked} img={lockImg} />
          <VacuumCard isOn={vacOn} onToggle={() => setVacOn(!vacOn)} img={vacImg} />
        </div>

      </div>
    </div>
  );
}