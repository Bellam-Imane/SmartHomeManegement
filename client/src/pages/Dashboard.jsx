import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importation des ressources visuelles (Images)
import livingRoomImg from '../assets/livingrom.jpeg';
import user1 from '../assets/profile1.jfif';
import climatiseurImg from '../assets/climatiseur-removebg-preview.png';
import lockImg from '../assets/sereure-removebg-preview.png';
import lightImg from '../assets/lumiére-removebg-preview.png';
import vacImg from '../assets/asp-removebg-preview.png';

const { translations } = require("../translations");

// Composant Toggle local
const Toggle = ({ on, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: 38, height: 22, borderRadius: 50, cursor: 'pointer',
      background: on ? '#1E232A' : 'hsl(210, 5%, 84%)',
      position: 'relative', transition: 'all 0.2s ease',
      flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', width: 16, height: 16, background: 'white',
      borderRadius: '50%', top: 3,
      left: on ? 'calc(100% - 19px)' : 3,
      transition: 'all 0.2s ease',
    }} />
  </div>
);

// Importation des composants de l'interface (Appareils)
import ClimateCard from '../components/DashboardDevices/ClimateCard';
import EnergyChart from '../components/DashboardDevices/EnergyChart';
import LightCard from '../components/DashboardDevices/LightCard';
import LockCard from '../components/DashboardDevices/LockCard';
import VacuumCard from '../components/DashboardDevices/VacuumCard';
import VoiceControlButton from '../components/VoiceControlButton';

// Importation des icônes
import { Thermometer, Sun, Zap, Droplets, Bell } from 'lucide-react';


export default function Dashboard({ unreadCount }) {
  // États locaux avec valeurs par défaut à "true"
  const [acOn, setAcOn] = useState(true);
  const [lightOn, setLightOn] = useState(true);
  const [vacOn, setVacOn] = useState(true);
  const [locked, setLocked] = useState(true);

  const [lightVal, setLightVal] = useState(36);
  const [activeTab, setActiveTab] = useState('Mois');

  // Nouveaux états pour le Backend et l'API Météo
  const [deviceIds, setDeviceIds] = useState({});
  const [homeStats, setHomeStats] = useState({
    tempInt: '24°C',
    tempExt: '--°C',
    energieCons: '13 kwh',
    humidite: '--%',
    energieSolaire: '78 kwh'
  });

  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "Français");
  const [currentUser, setCurrentUser] = useState({ nom: '', prenom: '', photo: user1 });

  // 1. Charger les données utilisateur et la météo
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(prev => ({
          ...prev,
          nom: parsed.nom || prev.nom,
          prenom: parsed.prenom || prev.prenom,
          photo: parsed.photo || prev.photo
        }));
      }
    };

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
          setCurrentUser({
            nom: res.data.nom || '',
            prenom: res.data.prenom || '',
            photo: res.data.photo || user1
          });

          // Logique pour la météo basée sur les préférences de l'utilisateur
          if (res.data.preferences?.language && !localStorage.getItem("language")) {
          setLanguage(res.data.preferences.language);
          }
          const userLocation = res.data.preferences?.location ?? {};
          if (userLocation)
            handleCityWeather(userLocation);
        }
      } catch (err) {
        console.error("Erreur fetching dashboard user", err);
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser({ nom: parsed.nom || '', prenom: parsed.prenom || '', photo: parsed.photo || user1 });
        }
      }
    };
    fetchUserData();
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const t = translations[language] || translations["Français"];

  // Fonctions pour gérer l'API Météo
  const handleCityWeather = (location) => {
    fetchWeather(location.lat, location.lon);
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
      const response = await axios.get(url);

      if (response.data && response.data.current) {
        setHomeStats(prev => ({
          ...prev,
          tempExt: `${Math.round(response.data.current.temperature_2m)}°C`,
          humidite: `${response.data.current.relative_humidity_2m}%`
        }));
      }
    } catch (err) {
      console.warn("⚠️ Erreur API Météo:", err.message);
    }
  };

  // 2. Charger l'état et les IDs des appareils depuis le backend (/api/pieces/all)
  useEffect(() => {
    const fetchAppareils = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/pieces/all', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const ids = {};
          res.data.pieces.forEach(piece => {
            piece.appareils.forEach(app => {
              const statusBool = app.status === 'ENLIGNE';

              if (app.typeAppareil === 'THERMIQUE') { setAcOn(statusBool); ids.ac = app._id; }
              if (app.typeAppareil === 'ECLAIRAGE') { setLightOn(statusBool); ids.light = app._id; setLightVal(app.intensite || 36); }
              if (app.typeAppareil === 'ASPIRATEUR') { setVacOn(statusBool); ids.vac = app._id; }
              if (app.typeAppareil === 'CAMERA' || app.typeAppareil === 'MOTORISE') { setLocked(statusBool); ids.lock = app._id; }
            });
          });
          setDeviceIds(ids); // Sauvegarder les IDs pour les requêtes PUT (Toggle)
        }
      } catch (err) {
        console.warn("⚠️ API Appareils non disponible, utilisation du mode hors-ligne.");
      }
    };
    fetchAppareils();
  }, []);

  // 3. Fonction pour gérer le toggle + appel API en arrière-plan
  const handleAppareilToggle = async (typeKey, currentState, setLocalState) => {
    const newState = !currentState;
    setLocalState(newState); // Changement immédiat de l'UI (Optimistic Update)

    const deviceId = deviceIds[typeKey];
    if (!deviceId) return; // Si pas d'ID (mode hors ligne), on s'arrête ici

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appareils/${deviceId}`,
        { status: newState ? 'ENLIGNE' : 'HORSLIGNE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(`Erreur de synchronisation pour ${typeKey}`, err);
      setLocalState(currentState); // Annuler le changement en cas d'erreur API
    }
  };

  // 4. 🔥 NOUVEAU: Fonction pour analyser les commandes vocales et répondre comme Siri 🔥
  // داخل المكون Dashboard، بدلي الدالة القديمة بهادي:
  // 4. 🔥 NOUVEAU: Fonction pour analyser les commandes vocales et répondre 🔥
  const executeVoiceCommand = (command) => {
    const { type, action, targetState } = command;

    // 1. التحكم في الأجهزة
    if (type === 'DEVICE_CONTROL') {
      // الذكاء الاصطناعي كيعرف واش بغيتي تشعلي (true) ولا تطفي (false)
      if (action === 'light' && lightOn !== targetState) handleAppareilToggle('light', lightOn, setLightOn);
      if (action === 'ac' && acOn !== targetState) handleAppareilToggle('ac', acOn, setAcOn);
      if (action === 'lock' && locked !== targetState) handleAppareilToggle('lock', locked, setLocked);
      if (action === 'vac' && vacOn !== targetState) handleAppareilToggle('vac', vacOn, setVacOn);
    }

    // 2. التنقل بين الصفحات (Navigation)
    if (type === 'NAVIGATE') {
      const pages = {
        'rapport': '/home/Reports',
        'notification': '/home/Notifications',
        'paramètre': '/home/Settings',
        'accueil': '/home/Dashboard'
      };
      if (pages[action]) {
        navigate(pages[action]);
      }
    }

    // (ماكاينش كود ديال READ_INFO هنا حيت البوطونة غتكلف وتجاوبك بالصوت نيشان)
  };
  const dataMap = {
    Jour: {
      labels: t.labelsJour || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      heights: [40, 65, 30, 85, 45, 90, 55]
    },
    Mois: {
      labels: t.labelsMois || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      heights: [38, 55, 42, 70, 60, 35, 75, 92, 55, 62, 48, 80]
    },
    Années: {
      labels: t.labelsAnnees || ['2021', '2022', '2023', '2024', '2025', '2026'],
      heights: [60, 40, 80, 50, 95, 70]
    }
  };

  const currentData = dataMap[activeTab] || dataMap["Mois"];

  return (
    <div
      dir={language === "العربية" ? "rtl" : "ltr"}
      style={{
        background: '#f0f2f5',
        minHeight: '100vh',
        padding: 'clamp(12px, 2vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(12px, 1.5vw, 16px)',
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } } 
        .live-dot { animation: pulse 1.2s infinite; } 
        @media (max-width: 900px) { .main-grid { grid-template-columns: 1fr 1fr !important; } } 
        @media (max-width: 600px) { .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            {t.welcome} {currentUser.prenom || t.userDefault}
          </h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>
            {t.subHeader}
            Gérer votre maison intelligente facilement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div onClick={() => navigate('/home/Notifications')} style={{ background: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <Bell size={20} color="#1a1a2e" />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '2px', right: '2px', background: '#ef4444',
                border: '1.5px solid #f0f2f5', borderRadius: '50%', width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: 'white'
              }}>{unreadCount}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={currentUser.photo} alt="Profil utilisateur" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{currentUser.prenom} {currentUser.nom?.charAt(0)}.</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', flex: 1 }}>
          {[
            { label: t.tempInt || 'Temp. intérieure', value: homeStats.tempInt, icon: <Thermometer size={16} color="#9ca3af" /> },
            { label: t.tempExt || 'Temp. extérieure', value: homeStats.tempExt, icon: <Sun size={16} color="#9ca3af" /> },
            { label: t.energyCons || 'Energie consommée', value: homeStats.energieCons, icon: <Zap size={16} color="#9ca3af" /> },
            { label: t.humidity || 'Humidité', value: homeStats.humidite, icon: <Droplets size={16} color="#9ca3af" /> },
            { label: t.solarEnergy || 'Energie solaire', value: homeStats.energieSolaire, icon: <Sun size={16} color="#9ca3af" /> }
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 4px 0' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{s.icon}<span style={{ fontSize: '16px', fontWeight: 700 }}>{s.value}</span></div>
            </div>
          ))}
        </div>


        {/* 🔥 هادا هو التغيير ديال البوطونة، دوزنا ليها الدالة 🔥 */}
        <VoiceControlButton
          onCommand={executeVoiceCommand}
          allData={{
            stats: homeStats,
            devices: { lightOn, acOn, locked, vacOn },
            user: currentUser
          }}
        />
      </div>

      {/* MAIN GRID */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', width: '100%', aspectRatio: '16/9', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <img src={livingRoomImg} alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, [language === "العربية" ? "right" : "left"]: 14, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="live-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /> {t.live}
            </div>
          </div>
          <EnergyChart activeTab={activeTab} setActiveTab={setActiveTab} currentData={currentData} />
        </div>

        {/* Column 2: Climatiseur & Lumière */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ClimateCard isOn={acOn} onToggle={() => handleAppareilToggle('ac', acOn, setAcOn)} img={climatiseurImg} />
          <LightCard isOn={lightOn} onToggle={() => handleAppareilToggle('light', lightOn, setLightOn)} val={lightVal} setVal={setLightVal} img={lightImg} />
        </div>

        {/* Column 3: Serrure & Aspirateur */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <LockCard isLocked={locked} onToggle={() => handleAppareilToggle('lock', locked, setLocked)} img={lockImg} />
          <VacuumCard isOn={vacOn} onToggle={() => handleAppareilToggle('vac', vacOn, setVacOn)} img={vacImg} />
        </div>

      </div>
    </div>
  );
}