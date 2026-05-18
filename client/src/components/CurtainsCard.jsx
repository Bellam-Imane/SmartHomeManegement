import React, { useState, useEffect } from 'react';
import { 
  Blinds, MoreVertical, ChevronLeft, ChevronRight, Moon, Sun, 
  ShieldCheck, Clapperboard
} from 'lucide-react';

/**
 * COMPOSANT CURTAINSCARD (Version Large & Horizontale)
 */
const CurtainsCard = ({ curtainsData, onUpdateAppareil, className = '' }) => {

  const items = Array.isArray(curtainsData) ? curtainsData : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState('Ombrage automatique');

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  if (items.length === 0) {
    /* CORRECTION : Remplacement de max-w-[860px] par w-full */
    return (
      <div className="w-full h-[230px] rounded-[45px] bg-[#ebf5ff] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des rideaux...
      </div>
    );
  }

  const currentCurtain = items[currentIndex];
  const isOn = currentCurtain.status === 'ENLIGNE';
  const pourcentage = currentCurtain.pourcentageOuverture || 0; 

  const nextCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const updateCurtainProperty = (property, value) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
        ...currentCurtain,
        [property]: value
      });
    }
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateCurtainProperty('status', nextStatus);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    updateCurtainProperty('pourcentageOuverture', value);
  };

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    if (!isOn) return; 
    
    switch(modeId) {
      case 'Veille': updateCurtainProperty('pourcentageOuverture', 0); break;
      case 'Réveil': updateCurtainProperty('pourcentageOuverture', 100); break;
      case 'Cinema': updateCurtainProperty('pourcentageOuverture', 20); break;
      case 'Ombrage automatique': updateCurtainProperty('pourcentageOuverture', 60); break;
      default: break;
    }
  };

  const modesList = [
    { id: 'Veille', label: 'Veille', icon: <Moon size={13} /> },
    { id: 'Réveil', label: 'Réveil', icon: <Sun size={13} /> },
    { id: 'Ombrage automatique', label: 'Ombrage', icon: <ShieldCheck size={13} /> },
    { id: 'Cinema', label: 'Cinema', icon: <Clapperboard size={13} /> },
  ];

  return (
    /* CORRECTION FINALE : Suppression de max-w-[860px] pour permettre à la carte de s'étirer sur toute la largeur disponible du parent */
    <div className={`relative w-full h-[230px] bg-[#ebf5ff] rounded-[45px] p-5 shadow-xl flex flex-col justify-between transition-all duration-500 select-none ${className}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center w-full px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Blinds size={20} className="text-gray-700" />
            <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">Rideaux</h3>
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
          <button className="text-gray-700 hover:bg-black/5 p-1 rounded-full transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* CONTENU CENTRAL : SLIDER & MODES HORIZONTAUX */}
      <div className="flex items-center justify-between w-full flex-1 mt-1">
        <button 
          onClick={prevCurtain} 
          className={`p-1 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <div className="flex-1 flex flex-col justify-center px-4 h-full gap-2">
          <span className="text-xs font-bold text-gray-500 text-left ml-2">
            {currentCurtain.nomAppareil || `Rideau ${currentIndex + 1}`} — <span className="text-gray-800 font-extrabold">{pourcentage}%</span>
          </span>

          {/* Slider Container */}
          <div className={`w-full relative flex items-center h-2 bg-gray-300/60 rounded-full transition-opacity ${!isOn && 'opacity-30 pointer-events-none'}`}>
            <div className="absolute left-0 h-full bg-gray-800 rounded-full" style={{ width: `${pourcentage}%` }} />
            <input 
              type="range" min="0" max="100" value={pourcentage} onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md transform -translate-x-1/2 pointer-events-none" style={{ left: `${pourcentage}%` }} />
          </div>

          {/* Modes aligned horizontally */}
          <div className={`flex gap-2 mt-1 justify-start transition-opacity ${!isOn && 'opacity-30 pointer-events-none'}`}>
            {modesList.map((item) => (
              <button
                key={item.id} onClick={() => handleModeChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all ${activeMode === item.id ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeMode === item.id ? 'bg-[#ebf5ff] text-blue-600' : 'bg-white text-gray-500 shadow-sm'}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={nextCurtain} 
          className={`p-1 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="text-left px-2 pt-1 border-t border-black/5 text-[10px] text-gray-500 italic font-medium">
        Suggestion IA : Fermer les rideaux à 14h00 pour économiser 15% sur la facture de climatisation.
      </div>
      
    </div>
  );
};

export default CurtainsCard;