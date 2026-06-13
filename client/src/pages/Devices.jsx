import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Lightbulb, Thermometer, ShieldCheck, Tv, Zap, Wifi,
  Camera, DoorOpen, Activity, Flame, Wind, Lock
} from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import VoiceControlButton from '../components/VoiceControlButton';

const { translations } = require("../translations");

const API_BASE = 'http://localhost:5000';

// ── MAP: typeAppareil -> { icon, colorClass } ──
const TYPE_CONFIG = {
  ECLAIRAGE:  { icon: Lightbulb,    colorClass: 'bg-yellow-100 text-yellow-600' },
  THERMIQUE:  { icon: Thermometer,  colorClass: 'bg-blue-100 text-blue-600' },
  MULTIMEDIA: { icon: Tv,           colorClass: 'bg-purple-100 text-purple-600' },
  MOTORISE:   { icon: Wind,         colorClass: 'bg-teal-100 text-teal-600' },
  CAMERA:     { icon: Camera,       colorClass: 'bg-green-100 text-green-600' },
  PORTE:      { icon: DoorOpen,     colorClass: 'bg-amber-100 text-amber-600' },
  CAPTEUR:    { icon: Activity,     colorClass: 'bg-rose-100 text-rose-600' },
  ASPIRATEUR: { icon: ShieldCheck,  colorClass: 'bg-cyan-100 text-cyan-600' },
  SECURITE:   { icon: Lock,         colorClass: 'bg-red-100 text-red-600' },
};

// ── 10 CATEGORIES with MongoDB typeAppareil mapping ──
const CATEGORIES = [
  { key: 'all',        fr: 'Tous',              en: 'All',              ar: 'الكل' },
  { key: 'eclairage',  fr: 'Lumières',          en: 'Lights',           ar: 'الإضاءة' },
  { key: 'securite',   fr: 'Sécurité',          en: 'Security',         ar: 'الأمن' },
  { key: 'thermique',  fr: 'Climat',            en: 'Climate',          ar: 'المناخ' },
  { key: 'multimedia', fr: 'TV',                en: 'TV',               ar: 'تلفاز' },
  { key: 'camera',     fr: 'Caméra',            en: 'Camera',           ar: 'كاميرا' },
  { key: 'motorise',   fr: 'Rideaux',           en: 'Curtains',         ar: 'الستائر' },
  { key: 'mouvement',  fr: 'Capteur mouvement', en: 'Motion Sensor',    ar: 'حساس الحركة' },
  { key: 'fumee',      fr: 'Capteur fumée',     en: 'Smoke Detector',   ar: 'حساس الدخان' },
  { key: 'porte',      fr: 'Porte',             en: 'Door',             ar: 'باب' },
];

// Category -> MongoDB typeAppareil(s)
const CATEGORY_MAP = {
  all:        null,
  eclairage:  ['ECLAIRAGE'],
  securite:   ['CAMERA', 'PORTE', 'CAPTEUR', 'SECURITE'],
  thermique:  ['THERMIQUE'],
  multimedia: ['MULTIMEDIA'],
  camera:     ['CAMERA'],
  motorise:   ['MOTORISE'],
  mouvement:  ['CAPTEUR'],  // + sub-filter typeCapteur === 'MOUVEMENT'
  fumee:      ['CAPTEUR'],  // + sub-filter typeCapteur === 'FUMEE'
  porte:      ['PORTE'],
};

// Capteur sub-type overrides icon
const CAPTEUR_ICON_MAP = {
  MOUVEMENT: { icon: Activity, colorClass: 'bg-orange-100 text-orange-600' },
  FUMEE:     { icon: Flame,    colorClass: 'bg-red-100 text-red-600' },
};

const Devices = () => {
  const [language, setLanguage] = useState("Français");
  const [appareils, setAppareils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [energyData, setEnergyData] = useState({ totalWatts: 0, totalKwh: 0 });

  const t = translations[language] || translations["Français"];

  // ── Fetch language preference ──
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ── Recalculate total watts from the current appareils list ──
  const recalcEnergy = useCallback((list) => {
    const totalWatts = list
      .filter(a => a.status === 'ENLIGNE')
      .reduce((sum, a) => sum + (a.consommationActuelle || 0), 0);

    const totalKwh = list.reduce((sum, a) => sum + (a.consommationCumulee || 0), 0);

    setEnergyData({
      totalWatts: Math.round(totalWatts),
      totalKwh: (totalKwh / 1000).toFixed(2)
    });
  }, []);

  // ── Fetch all appareils from backend ──
  const fetchAppareils = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/appareils`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data || [];
      setAppareils(data);
      recalcEnergy(data);
      setLoading(false);
    } catch (err) {
      console.error("[Devices] Failed to fetch appareils:", err.message);
      setLoading(false);
    }
  }, [recalcEnergy]);

  useEffect(() => {
    fetchAppareils();
  }, [fetchAppareils]);

  // ── Fetch dashboard summary for cumulative kWh ──
  const fetchEnergySummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.sensors) {
        setEnergyData(prev => ({
          totalWatts: prev.totalWatts,
          totalKwh: (res.data.sensors.energieConsommee / 1000).toFixed(2) || prev.totalKwh
        }));
      }
    } catch (err) {
      console.warn("[Devices] Could not fetch energy summary:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchEnergySummary();
  }, [fetchEnergySummary]);

  // ── Socket.IO: Real-time updates (with JWT auth for user-scoped rooms) ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    socket.on('appareil_update', (data) => {
      const { deviceId, payload } = data;
      setAppareils(prev => {
        const updated = prev.map(a =>
          a._id === deviceId ? { ...a, ...payload } : a
        );
        recalcEnergy(updated);
        return updated;
      });
    });

    socket.on('global_energy_update', (data) => {
      if (data.consommationTotale !== undefined) {
        setEnergyData(prev => ({
          ...prev,
          totalKwh: (data.consommationTotale / 1000).toFixed(2)
        }));
      }
    });

    return () => { socket.disconnect(); };
  }, [recalcEnergy]);

  // ── Toggle device via API ──
  const toggleDevice = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ENLIGNE' ? 'HORSLIGNE' : 'ENLIGNE';
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE}/api/appareils/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAppareils(prev => {
          const updated = prev.map(a => a._id === id ? { ...a, status: newStatus } : a);
          recalcEnergy(updated);
          return updated;
        });
      }
    } catch (err) {
      console.error("[Devices] Toggle failed:", err.message);
    }
  };

  // ── Filter appareils by selected category ──
  const filteredAppareils = selectedCategory === 'all'
    ? appareils
    : appareils.filter(a => {
        const types = CATEGORY_MAP[selectedCategory];
        if (!types || !types.includes(a.typeAppareil)) return false;
        // Sub-filter for capteurs
        if (selectedCategory === 'mouvement' && a.typeCapteur !== 'MOUVEMENT') return false;
        if (selectedCategory === 'fumee' && a.typeCapteur !== 'FUMEE') return false;
        return true;
      });

  // ── Counters ──
  const activeCount = appareils.filter(a => a.status === 'ENLIGNE').length;
  const totalCount = appareils.length;

  // ── Helper: get icon + color for a device ──
  const getDeviceVisuals = (appareil) => {
    // Special case: Capteurs have sub-types
    if (appareil.typeAppareil === 'CAPTEUR' && CAPTEUR_ICON_MAP[appareil.typeCapteur]) {
      return CAPTEUR_ICON_MAP[appareil.typeCapteur];
    }
    return TYPE_CONFIG[appareil.typeAppareil] || { icon: Zap, colorClass: 'bg-gray-100 text-gray-600' };
  };

  // ── Translate category label ──
  const getCategoryLabel = (cat) => {
    if (language === "العربية") return cat.ar;
    if (language === "English") return cat.en;
    return cat.fr;
  };

  // ── Translate device name ──
  const getDeviceName = (appareil) => {
    return appareil.nomAppareil || 'Appareil';
  };

  // ── Translate room name ──
  const getRoomName = (appareil) => {
    if (appareil.piece?.nomPiece) {
      const piece = appareil.piece.nomPiece;
      if (t.roomsNames && t.roomsNames[piece.toLowerCase()]) {
        return t.roomsNames[piece.toLowerCase()];
      }
      return piece;
    }
    return '';
  };

  return (
    <div className="p-8 min-h-screen" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* --- Header --- */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {language === "العربية" ? "أجهزتي" : language === "English" ? "My Devices" : "Mes Appareils"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {language === "العربية" ? "التحكم في جميع أرجاء منزلك" : language === "English" ? "Control your entire home" : "Contrôlez l'ensemble de votre maison"}
          </p>
        </div>
        <VoiceControlButton onClick={() => console.log("Microphone cliqué dans Devices")} />
      </header>

      {/* --- Stats Cards --- */}
      <div className="flex gap-4 mb-10 flex-wrap">
        {/* Energy Card */}
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 min-w-[180px] max-w-[220px]">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Zap size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">{t.energy || "Énergie"}</p>
            <p className="font-bold">{energyData.totalWatts} W</p>
            <p className="text-[10px] text-gray-400">{energyData.totalKwh} kWh cumulés</p>
          </div>
        </div>

        {/* Active Devices Card */}
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 min-w-[180px] max-w-[220px]">
          <div className="bg-green-100 p-2 rounded-xl text-green-600"><Wifi size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">
              {language === "العربية" ? "نشط" : language === "English" ? "Active" : "Actifs"}
            </p>
            <p className="font-bold">{activeCount} / {totalCount}</p>
          </div>
        </div>
      </div>

      {/* --- Categories Filter --- */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              selectedCategory === cat.key
                ? 'bg-[#1e293b] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* --- Devices Grid --- */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
        </div>
      ) : filteredAppareils.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">
            {language === "العربية" ? "لا توجد أجهزة في هذه الفئة"
              : language === "English" ? "No devices in this category"
              : "Aucun appareil dans cette catégorie"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAppareils.map(appareil => {
            const { icon, colorClass } = getDeviceVisuals(appareil);
            const isOn = appareil.status === 'ENLIGNE';

            return (
              <DeviceCard
                key={appareil._id}
                id={appareil._id}
                name={getDeviceName(appareil)}
                room={getRoomName(appareil)}
                type={appareil.typeAppareil?.toLowerCase()}
                isOn={isOn}
                icon={icon}
                onToggle={() => toggleDevice(appareil._id, appareil.status)}
                colorClass={colorClass}
                consommationActuelle={appareil.consommationActuelle}
                typeAppareil={appareil.typeAppareil}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Devices;
