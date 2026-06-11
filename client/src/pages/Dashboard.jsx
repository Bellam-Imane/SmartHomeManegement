import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSecurity } from '../context/SecurityContext';
// --- IMPORTATION DES RESSOURCES VISUELLES (IMAGES) ---
import livingRoomImg from '../assets/livingrom.jpeg';
import user1 from '../assets/profile1.jfif';
import climatiseurImg from '../assets/climatiseur-removebg-preview.png';
import lockImg from '../assets/sereure-removebg-preview.png';
import lightImg from '../assets/lumiére-removebg-preview.png';
import vacImg from '../assets/asp-removebg-preview.png';

// Importation du fichier de traduction
const { translations } = require("../translations");

// Composant de basculement (Toggle) local
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

// --- IMPORTATION DES COMPOSANTS DE L'INTERFACE ---
import ClimateCard from '../components/DashboardDevices/ClimateCard';
import EnergyChart from '../components/DashboardDevices/EnergyChart';
import LightCard from '../components/DashboardDevices/LightCard';
import LockCard from '../components/DashboardDevices/LockCard';
import VacuumCard from '../components/DashboardDevices/VacuumCard';
import VoiceControlButton from '../components/VoiceControlButton';

// Importation des icônes de la bibliothèque lucide-react
import { Thermometer, Sun, Zap, Droplets, Bell } from 'lucide-react';

export default function Dashboard({ unreadCount }) {
  // États pour les contrôles des appareils (Valeurs par défaut)
  const [acOn, setAcOn] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [vacOn, setVacOn] = useState(false);
  const [lightVal, setLightVal] = useState(36);
  const [activeTab, setActiveTab] = useState('Mois');
  const { locks, setLocks } = useSecurity();
  // États pour la gestion des IDs du Backend et les statistiques
  const [deviceIds, setDeviceIds] = useState({});
  const [homeStats, setHomeStats] = useState({
    tempInt: '--°C',
    tempExt: '--°C',
    energieCons: '-- kwh',
    humidite: '--%',
    energieSolaire: '-- kwh'
  });
  const [dashboardUnread, setDashboardUnread] = useState(0);

  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem("language") || "Français");
  const [currentUser, setCurrentUser] = useState({ nom: '', prenom: '', photo: user1 });

  // Configuration initiale des données du graphique
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    heights: [38, 55, 42, 70, 60, 35, 75, 92, 55, 62, 48, 80],
    temperature: []
  });

  // 1. Chargement initial des données utilisateur et de la météo
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

          if (res.data.preferences?.language && !localStorage.getItem("language")) {
            setLanguage(res.data.preferences.language);
          }
          
          const userLocation = res.data.preferences?.location ?? {};
          if (userLocation.lat && userLocation.lon) {
            handleCityWeather(userLocation);
          } else {
            // Localisation par défaut pour Taroudant si non spécifiée
            handleCityWeather({ lat: 30.470651, lon: -8.877922 });
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération du profil", err);
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setCurrentUser({ nom: parsed.nom || '', prenom: parsed.prenom || '', photo: parsed.photo || user1 });
        }
        // Fallback météo par défaut en cas d'erreur de profil
        handleCityWeather({ lat: 30.470651, lon: -8.877922 });
      }
    };
    
    fetchUserData();
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const t = translations[language] || translations["Français"];

  // Gestion de l'API Météo (Open-Meteo)
  const handleCityWeather = (location) => {
    fetchWeather(location.lat, location.lon);
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
      const response = await axios.get(url);

      if (response.data && response.data.current) {
        const weatherData = {
          tempExt: `${Math.round(response.data.current.temperature_2m)}°C`,
          humidite: `${response.data.current.relative_humidity_2m}%`
        };
        setHomeStats(prev => ({ ...prev, ...weatherData }));
        // التخزين الذكي للبيانات الصحيحة عند نجاح الطلب
        localStorage.setItem('last_weather', JSON.stringify(weatherData));
      }
    } catch (err) {
      console.warn("⚠️ Erreur API Météo (CORS/Network), activation du Fallback Caching:", err.message);
      // استرجاع آخر بيانات تم حفظها قبل انقطاع الخدمة أو حدوث CORS
      const cached = localStorage.getItem('last_weather');
      if (cached) {
        const parsed = JSON.parse(cached);
        setHomeStats(prev => ({ ...prev, ...parsed }));
      } else {
        // قيم احتياطية أساسية في حالة تشغيل التطبيق لأول مرة بدون إنترنت
        setHomeStats(prev => ({ ...prev, tempExt: '26°C', humidite: '55%' }));
      }
    }
  };

  // 2. Récupération du résumé Dashboard depuis le Backend
  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data) {
          const { sensors, devices, stats } = res.data;

          setHomeStats(prev => ({
            ...prev,
            tempInt: sensors.temperatureInterieure !== null ? `${sensors.temperatureInterieure}°C` : '--°C',
            energieCons: `${sensors.energieConsommee} kwh`,
            energieSolaire: `${sensors.energieSolaire} kwh`
          }));

          const ids = {};
          if (devices.climatiseur) {
            setAcOn(devices.climatiseur.status === 'ENLIGNE');
            ids.ac = devices.climatiseur._id;
          }
          if (devices.lumiere) {
            setLightOn(devices.lumiere.status === 'ENLIGNE');
            ids.light = devices.lumiere._id;
            setLightVal(devices.lumiere.intensite || 36);
          }
          if (devices.serrure) {
            ids.lock = devices.serrure._id;
          }
          if (devices.aspirateur) {
            setVacOn(devices.aspirateur.status === 'ENLIGNE');
            ids.vac = devices.aspirateur._id;
          }
          setDeviceIds(ids);

          if (stats.unreadNotifications !== undefined) {
            setDashboardUnread(stats.unreadNotifications);
          }
        }
      } catch (err) {
        console.warn("⚠️ Mode hors-ligne : API Dashboard non disponible.");
      }
    };
    fetchDashboardSummary();
  }, []);

  // 3. Fonction de mise à jour de l'état d'un appareil (UI + API)
  const handleAppareilToggle = async (typeKey, currentState, setLocalState) => {
    const newState = !currentState;
    setLocalState(newState);

    const deviceId = deviceIds[typeKey];
    if (!deviceId) return; 

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appareils/${deviceId}`,
        { status: newState ? 'ENLIGNE' : 'HORSLIGNE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(`Erreur de synchronisation (${typeKey})`, err);
      setLocalState(currentState);
    }
  };

  // 3b. Fonction de mise à jour de l'intensité lumineuse (Slider → API → MQTT)
  const handleLightIntensity = async (newVal) => {
    const deviceId = deviceIds.light;
    if (!deviceId) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appareils/${deviceId}`,
        { status: 'ENLIGNE', intensite: newVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Erreur sync intensité lumière', err);
    }
  };

  // 4. Analyse et exécution des commandes vocales
  const executeVoiceCommand = (command) => {
    const { type, action, targetState } = command;

    if (type === 'DEVICE_CONTROL') {
      if (action === 'light' && lightOn !== targetState) handleAppareilToggle('light', lightOn, setLightOn);
      if (action === 'ac' && acOn !== targetState) handleAppareilToggle('ac', acOn, setAcOn);
      if (action === 'lock' && locks.entree !== targetState) toggleMainLock(); 
      if (action === 'vac' && vacOn !== targetState) handleAppareilToggle('vac', vacOn, setVacOn);
    }

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
  };

  // Fetch energy chart data when activeTab changes
  useEffect(() => {
    const fetchEnergyChart = async () => {
      try {
        const token = localStorage.getItem('token');
        const rangeMap = { 'Jour': '-24h', 'Mois': '-30d', 'Années': '-1y' };
        const windowMap = { 'Jour': '1h', 'Mois': '1d', 'Années': '30d' };
        const range = rangeMap[activeTab] || '-30d';
        const window = windowMap[activeTab] || '1d';

        const res = await axios.get(`http://localhost:5000/api/dashboard/energy?range=${range}&window=${window}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.count > 0) {
          const { labels, consumption, temperature } = res.data;
          const maxVal = Math.max(...consumption, 1);
          const heights = consumption.map(v => Math.round((v / maxVal) * 100));
          setChartData({ labels, heights, temperature });
        } else {
          // Fallback labels complexes si le backend renvoie un tableau vide
          if (activeTab === 'Jour') {
            setChartData(prev => ({ ...prev, labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'] }));
          } else if (activeTab === 'Mois') {
            setChartData(prev => ({ ...prev, labels: ['01 Juin', '11 Juin', '21 Juin', '30 Juin'] }));
          } else {
            setChartData(prev => ({ ...prev, labels: ['2024', '2025', '2026'] }));
          }
        }
      } catch (err) {
        console.warn("⚠️ Chart data fetch failed, using defaults based on activeTab:", err.message);
      }
    };
    fetchEnergyChart();
  }, [activeTab]);

  const toggleMainLock = async () => {
    const newValue = !locks.entree; 
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/security', 
        { type: 'locks', name: 'entree', value: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocks(prev => ({ ...prev, entree: newValue }));
    } catch (err) {
      console.error("Erreur sync Lock", err);
    }
  };

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

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            {t.welcome} {currentUser.prenom || t.userDefault}
          </h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>
            {t.subHeader} Gérer votre maison intelligente facilement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div onClick={() => navigate('/home/Notifications')} style={{ background: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
            <Bell size={20} color="#1a1a2e" />
            {dashboardUnread > 0 && (
              <div style={{
                position: 'absolute', top: '2px', right: '2px', background: '#ef4444',
                border: '1.5px solid #f0f2f5', borderRadius: '50%', width: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: 'white'
              }}>{dashboardUnread}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={currentUser.photo} alt="Profil" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>{currentUser.prenom} {currentUser.nom?.charAt(0)}.</span>
          </div>
        </div>
      </div>

      {/* STATISTIQUES RAPIDES */}
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

        <VoiceControlButton
          onCommand={executeVoiceCommand}
          allData={{
            stats: homeStats,
            devices: { 
              lightOn, 
              acOn, 
              locked: locks.entree, 
              vacOn 
            },
            user: currentUser
          }}
        />
      </div>

      {/* GRILLE PRINCIPALE DU DASHBOARD */}
      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', width: '100%', aspectRatio: '16/9', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <img src={livingRoomImg} alt="Salon Live" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, [language === "العربية" ? "right" : "left"]: 14, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="live-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /> {t.live}
            </div>
          </div>
          <EnergyChart activeTab={activeTab} setActiveTab={setActiveTab} currentData={chartData} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ClimateCard isOn={acOn} onToggle={() => handleAppareilToggle('ac', acOn, setAcOn)} img={climatiseurImg} />
          <LightCard isOn={lightOn} onToggle={() => handleAppareilToggle('light', lightOn, setLightOn)} val={lightVal} setVal={setLightVal} img={lightImg} onIntensityChange={handleLightIntensity} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <LockCard isLocked={locks.entree} onToggle={toggleMainLock} img={lockImg} />
          <VacuumCard isOn={vacOn} onToggle={() => handleAppareilToggle('vac', vacOn, setVacOn)} img={vacImg} />
        </div>
      </div>
    </div>
  );
}