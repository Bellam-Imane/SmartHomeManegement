import React, { useState } from 'react';
import { Lightbulb, Thermometer, ShieldCheck, Tv, Zap, Wifi } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import VoiceControlButton from '../components/VoiceControlButton'; // Import dyal l-bouton


const Devices = () => {

  const myBulbs = [
    { id: 1, nomAppareil: 'Lampe Bureau', status: 'ENLIGNE', intensite: 80, couleur: '#FFCC00' },
    { id: 2, nomAppareil: 'Lampe Table', status: 'HORSLIGNE', intensite: 50, couleur: '#FFFFFF' }
  ];

  const [devices, setDevices] = useState([
    { id: 1, name: 'Lumière Plafond', room: 'Salon', type: 'light', isOn: true, icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
    { id: 2, name: 'Climatiseur', room: 'Chambre', type: 'climat', isOn: false, icon: Thermometer, color: 'bg-blue-100 text-blue-600' },
    { id: 3, name: 'Caméra Entrée', room: 'Extérieur', type: 'security', isOn: true, icon: ShieldCheck, color: 'bg-green-100 text-green-600' },
    { id: 4, name: 'Smart TV', room: 'Salon', type: 'media', isOn: false, icon: Tv, color: 'bg-purple-100 text-purple-600' },
  ]);

  const handleVoiceClick = () => {
    console.log("Microphone cliqué dans Devices");
    // Hna nqdero nbdaw ndiro l-logique dyal voice control mn b3d
  };

  const toggleDevice = (id) => {
    setDevices(devices.map(dev => dev.id === id ? { ...dev, isOn: !dev.isOn } : dev));
  };

  const activeCount = devices.filter(d => d.isOn).length;

  return (
    <div className="p-8 min-h-screen">
      {/* --- Header --- */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Appareils</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Contrôlez l'ensemble de votre maison</p>
        </div>
        {/* Zdna l-bouton hna bhal l-page Rooms */}
        <VoiceControlButton onClick={handleVoiceClick} />
      </header>

      {/* --- Stats Cards --- */}
      <div className="flex gap-4 mb-10">
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 max-w-[200px]">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Zap size={20}/></div>
          <div><p className="text-xs text-gray-500">Energie</p><p className="font-bold">12.4 kWh</p></div>
        </div>
        <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex items-center gap-4 flex-1 max-w-[200px]">
          <div className="bg-green-100 p-2 rounded-xl text-green-600"><Wifi size={20}/></div>
          <div><p className="text-xs text-gray-500">Actifs</p><p className="font-bold">{activeCount} / {devices.length}</p></div>
        </div>
      </div>

      {/* --- Categories Filter --- */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {['Tous', 'Lumières', 'Sécurité', 'Climat', 'Média'].map((cat, i) => (
          <button key={i} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
            i === 0 ? 'bg-[#1e293b] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
          }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* --- Devices Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {devices.map(device => (
          <DeviceCard 
            key={device.id}
            {...device}
            onToggle={() => toggleDevice(device.id)}
            colorClass={device.color}
          />
        ))}
      </div>

        

    </div>
    

  );
};

export default Devices;