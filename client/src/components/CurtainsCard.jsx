import React, { useState, useEffect } from 'react';      
import { 
  Blinds, MoreVertical, ChevronLeft, ChevronRight, Moon, Sun, 
  ShieldCheck, Clapperboard, Settings2
} from 'lucide-react';

/**
 * COMPOSANT CURTAINSCARD (Version Large & Horizontale)
 * Gère l'affichage dynamique et le contrôle des rideaux connectés.
 */
const CurtainsCard = ({ curtainsData, onUpdateAppareil, className = '' }) => {

  const items = Array.isArray(curtainsData) ? curtainsData : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState('Ombrage automatique');

  // ✅ إصلاح: حماية من out of bounds + dependency correct
  useEffect(() => {
    if (items.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  const currentCurtain = items[currentIndex];

  // مزامنة mode من backend
  useEffect(() => {
    if (currentCurtain?.mode) {
      setActiveMode(currentCurtain.mode);
    }
  }, [currentCurtain]);

  if (items.length === 0) {
    return (
      <div className="w-full h-[230px] rounded-[45px] bg-[#ebf5ff] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des rideaux...
      </div>
    );
  }

  const isOn = currentCurtain?.status === 'ENLIGNE';
  const pourcentage = currentCurtain?.pourcentageOuverture || 0;

  const nextCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const updateCurtainProperty = (property, value) => {
    if (!onUpdateAppareil || !currentCurtain) return;

    onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
      ...currentCurtain,
      [property]: value  
    });
  };

  const togglePower = () => {
    updateCurtainProperty('status', isOn ? 'HORSLIGNE' : 'ENLIGNE');
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);

    setActiveMode('Manuel');

    updateCurtainProperty('pourcentageOuverture', value);
    updateCurtainProperty('mode', 'Manuel');
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    if (!isOn || !currentCurtain) return;

    let nextPourcentage = pourcentage;

    switch(modeId) {
      case 'Veille': nextPourcentage = 0; break;
      case 'Réveil': nextPourcentage = 100; break;
      case 'Cinema': nextPourcentage = 20; break;
      case 'Ombrage automatique': nextPourcentage = 60; break;
      default: break;
    }

    updateCurtainProperty('pourcentageOuverture', nextPourcentage);
    updateCurtainProperty('mode', modeId);
  };

  const modesList = [
    { id: 'Veille', label: 'Veille', icon: <Moon size={13} />, desc: "Mode Veille : Les rideaux sont complètement fermés (0%) pour préserver votre sommeil." },
    { id: 'Réveil', label: 'Réveil', icon: <Sun size={13} />, desc: "Mode Réveil : Les rideaux sont entièrement ouverts (100%) pour laisser entrer la lumière du jour." },
    { id: 'Ombrage automatique', label: 'Ombrage', icon: <ShieldCheck size={13} />, desc: "Mode Ombrage : Ouverture optimale (60%) pour réguler naturellement la température de la pièce." },
    { id: 'Cinema', label: 'Cinema', icon: <Clapperboard size={13} />, desc: "Mode Cinéma : Rideaux presque fermés (20%) pour une immersion totale sans reflets sur vos écrans." },
    { id: 'Manuel', label: 'Manuel', icon: <Settings2 size={13} />, desc: "Mode Manuel : Ajustement personnalisé de l'ouverture selon vos préférences actuelles." }
  ];

  const currentModeObj = modesList.find(m => m.id === activeMode) || modesList[2];

  const modeDescription = isOn 
    ? currentModeObj.desc 
    : "Appareil hors ligne. Allumez les rideaux pour activer le mode et configurer l'ouverture.";

  return (
    <div className={`relative w-full h-[230px] bg-[#ebf5ff] rounded-[45px] p-5 shadow-xl flex flex-col justify-between transition-all duration-500 select-none ${className}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center w-full px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Blinds size={20} className="text-gray-700" />
            <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
              {currentCurtain?.nomAppareil || 'Rideau'}
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium ml-7">
            {items.length} appareils connectés
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={togglePower}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex items-center justify-between w-full flex-1 mt-1">
        <button onClick={prevCurtain}>
          <ChevronLeft size={24} />
        </button>

        <div className="flex-1 flex flex-col justify-center px-4 gap-4">

          <div className="relative w-full h-2 bg-gray-300/60 rounded-full mt-4">
            <div className="absolute left-0 h-full bg-gray-800 rounded-full" style={{ width: `${pourcentage}%` }} />

            <input
              type="range"
              min="0"
              max="100"
              value={pourcentage}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0"
            />

            <div
              className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full"
              style={{ left: `${pourcentage}%` }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {modesList.map((item) => (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id)}
                className="px-3 py-1 rounded-xl"
              >
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))}
          </div>

        </div>

        <button onClick={nextCurtain}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="text-[10px] text-gray-500 italic">
        {modeDescription}
      </div>
      
    </div>
  );
};

export default CurtainsCard;