import React, { useState, useEffect } from 'react';
import { Lightbulb, Thermometer, ShieldCheck, Tv, Zap, Wifi } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import VoiceControlButton from '../components/VoiceControlButton'; 
import CameraCard from '../components/CameraCard'; 
import RoomUsersCard from '../components/RoomUsersCard';


const { translations } = require("../translations");

const Devices = () => {
  const [language, setLanguage] = useState("Français");


  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = translations[language] || translations["Français"];

  const myBulbs = [
    { id: 1, nomAppareil: 'Lampe Bureau', status: 'ENLIGNE', intensite: 80, couleur: '#FFCC00' },
    { id: 2, nomAppareil: 'Lampe Table', status: 'HORSLIGNE', intensite: 50, couleur: '#FFFFFF' }
  ];

  const [devices, setDevices] = useState([
    { id: 1, nameKey: 'lumierePlat', defaultName: 'Lumière Plafond', roomKey: 'salon', defaultRoom: 'Salon', type: 'light', isOn: true, icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
    { id: 2, nameKey: 'climatiseur', defaultName: 'Climatiseur', roomKey: 'chambre', defaultRoom: 'Chambre', type: 'climat', isOn: false, icon: Thermometer, color: 'bg-blue-100 text-blue-600' },
    { id: 3, nameKey: 'cameraEntree', defaultName: 'Caméra Entrée', roomKey: 'exterieur', defaultRoom: 'Extérieur', type: 'security', isOn: true, icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
    { id: 4, nameKey: 'smartTv', defaultName: 'Smart TV', roomKey: 'salon', defaultRoom: 'Salon', type: 'media', isOn: false, icon: Tv, color: 'bg-purple-100 text-purple-600' },
  ]);

  const handleVoiceClick = () => {
    console.log("Microphone cliqué dans Devices");
  };

  const toggleDevice = (id) => {
    setDevices(devices.map(dev => dev.id === id ? { ...dev, isOn: !dev.isOn } : dev));
  };

  const activeCount = devices.filter(d => d.isOn).length;

  
  const categories = language === "العربية" 
    ? ['الكل', 'الإضاءة', 'الأمن', 'المكيف', 'الميديا']
    : language === "English"
    ? ['All', 'Lights', 'Security', 'Climate', 'Media']
    : ['Tous', 'Lumières', 'Sécurité', 'Climat', 'Média'];

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
        <VoiceControlButton onClick={handleVoiceClick} />
      </header>

      {/* --- Stats Cards --- */}
      <div className="flex gap-4 mb-10">
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 max-w-[200px]">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Zap size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">{t.energy || "Énergie"}</p>
            <p className="font-bold">12.4 kWh</p>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 max-w-[200px]">
          <div className="bg-green-100 p-2 rounded-xl text-green-600"><Wifi size={20}/></div>
          <div>
            <p className="text-xs text-gray-500">
              {language === "العربية" ? "نشط" : language === "English" ? "Active" : "Actifs"}
            </p>
            <p className="font-bold">{activeCount} / {devices.length}</p>
          </div>
        </div>
      </div>

      {/* --- Categories Filter --- */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {categories.map((cat, i) => (
          <button key={i} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            i === 0 ? 'bg-[#1e293b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* --- Devices Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.map(device => {
        
          let translatedName = device.defaultName;
          if (device.nameKey === 'lumierePlat') translatedName = language === "العربية" ? "إضاءة السقف" : language === "English" ? "Ceiling Light" : "Lumière Plafond";
          if (device.nameKey === 'climatiseur') translatedName = t.climatiseur || device.defaultName;
          if (device.nameKey === 'cameraEntree') translatedName = language === "العربية" ? "كاميرا المدخل" : language === "English" ? "Entrance Camera" : "Caméra Entrée";
          if (device.nameKey === 'smartTv') translatedName = language === "العربية" ? "تلفاز ذكي" : language === "English" ? "Smart TV" : "Smart TV";

          
          let translatedRoom = device.defaultRoom;
          if (t.roomsNames && t.roomsNames[device.roomKey]) {
            translatedRoom = t.roomsNames[device.roomKey];
          } else if (device.roomKey === 'chambre') {
            translatedRoom = language === "العربية" ? "الغرفة" : language === "English" ? "Bedroom" : "Chambre";
          }

          return (
            <DeviceCard 
              key={device.id}
              id={device.id}
              name={translatedName}
              room={translatedRoom}
              type={device.type}
              isOn={device.isOn}
              icon={device.icon}
              onToggle={() => toggleDevice(device.id)}
              colorClass={device.color}
            />
          );
        })}
      </div>

    </div>
  );
};

export default Devices;