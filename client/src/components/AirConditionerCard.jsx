import React, { useState, useEffect } from 'react';
import { 
  Wind, MoreVertical, ChevronLeft, ChevronRight, Plus, Minus, 
  Settings, Snowflake, Flame 
} from 'lucide-react';
import acImage from '../assets/images/climatiseur.png';

/**
 * COMPOSANT AIRCONDITIONERCARD
 */
const AirConditionerCard = ({ acData, onUpdateAppareil }) => {

  // Assurer que les donnees sont sous forme de tableau
  const items = Array.isArray(acData) ? acData : [];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reinitialisation de l'index en cas de modification de la liste
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Affichage temporaire si aucun appareil n'est trouve
  if (items.length === 0) {
    return (
      <div className="w-full max-w-[850px] h-[220px] rounded-[35px] bg-[#f4ebe1] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des climatiseurs...
      </div>
    );
  }

  // Selection de l'appareil courant
  const currentAc = items[currentIndex];

  // Extraction des proprietes de l'appareil selectionne
  const isOn = currentAc.status === 'ENLIGNE';
  const temperature = currentAc.temperatureCible || 25;
  const mode = currentAc.mode || 'AUTO'; 

  // Passage au climatiseur suivant
  const nextAc = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Retour au climatiseur precedent
  const prevAc = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Notification des changements au composant parent
  const updateAcProperty = (property, value) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentAc._id || currentAc.id, {
        ...currentAc,
        [property]: value
      });
    }
  };

  // Alternance entre ENLIGNE et HORSLIGNE
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateAcProperty('status', nextStatus);
  };

  // Augmentation de la temperature (max 30)
  const incrementTemp = () => {
    if (temperature < 30) {
      updateAcProperty('temperatureCible', temperature + 1);
    }
  };

  // Diminution de la temperature (min 16)
  const decrementTemp = () => {
    if (temperature > 16) {
      updateAcProperty('temperatureCible', temperature - 1);
    }
  };

  // Modification du mode de fonctionnement
  const changeMode = (newMode) => {
    updateAcProperty('mode', newMode); 
  };

  return (
    <div className="relative w-full max-w-[880px] bg-[#f4ebe1] rounded-[40px] p-6 shadow-lg flex flex-col justify-between min-h-[240px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Wind size={22} className="text-gray-700" />
            <h3 className="text-xl font-bold text-gray-800">
              {currentAc.nomAppareil || 'Climatiseur'}
            </h3>
          </div>
          {/* Modification du texte ici pour afficher connectes */}
          <span className="text-[11px] text-gray-500 font-bold tracking-tight mt-0.5 ml-8 text-left">
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
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* ================= SECTION CENTRALE CONTENU ================= */}
      <div className="flex items-center justify-between w-full mt-4 relative px-2">
        <button 
          onClick={prevAc} 
          className={`p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <div className="flex-1 grid grid-cols-3 items-center justify-items-center gap-4 px-4">
          
          {/* Colonne 1 : Image de l'appareil */}
          <div className="relative w-full max-w-[180px] flex items-center justify-center">
            <img 
              src={acImage} 
              alt="Climatiseur" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 drop-shadow-md' : 'opacity-40 brightness-95'}`} 
            />
            {isOn && (
              <span className="absolute top-[38%] text-[10px] font-bold text-white/80 tracking-tighter animate-pulse">
                {temperature}°C
              </span>
            )}
          </div>

          {/* Colonne 2 : Interface Thermostat */}
          <div className={`relative w-36 h-36 flex items-center justify-center transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-300/40 flex items-center justify-center">
              <div 
                className="absolute w-full h-full rounded-full transition-transform duration-300"
                style={{ transform: `rotate(${(temperature - 16) * 15}deg)` }}
              >
                <div className="w-2.5 h-2.5 bg-black rounded-full absolute -top-1 left-[47%]" />
              </div>
            </div>

            <div className="z-10 flex flex-col items-center justify-center bg-[#f4ebe1] rounded-full w-28 h-28 shadow-inner">
              <span className="text-2xl font-black text-gray-800">{temperature}°C</span>
              
              <div className="flex items-center gap-3 mt-1">
                <button onClick={decrementTemp} className="p-1 bg-white hover:bg-gray-100 rounded-md shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-transform">
                  <Minus size={12} />
                </button>
                <button onClick={incrementTemp} className="p-1 bg-white hover:bg-gray-100 rounded-md shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-transform">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Colonne 3 : Modes de fonctionnement */}
          <div className={`flex flex-col gap-3 w-full max-w-[160px] transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            
            <button 
              onClick={() => changeMode('AUTO')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'AUTO' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Settings size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">AUTO</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

            <button 
              onClick={() => changeMode('FROID')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'FROID' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 bg-blue-100/60">
                <Snowflake size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">FROID</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

            <button 
              onClick={() => changeMode('CHAUD')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'CHAUD' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 bg-orange-100/60">
                <Flame size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">CHAUD</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

          </div>
        </div>

        <button 
          onClick={nextAc} 
          className={`p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
      
    </div>
  );
};

export default AirConditionerCard;