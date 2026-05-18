import React, { useState, useEffect } from 'react';
import { 
  Wind, MoreVertical, ChevronLeft, ChevronRight, Plus, Minus, 
  Settings, Snowflake, Flame 
} from 'lucide-react';
import acImage from '../assets/images/climatiseur.png';

/**
 * COMPOSANT AIRCONDITIONERCARD (Version Large & Horizontale)
 */
const AirConditionerCard = ({ acData, onUpdateAppareil, className = '' }) => {

  const items = Array.isArray(acData) ? acData : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[860px] h-[230px] rounded-[45px] bg-[#f4ebe1] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des climatiseurs...
      </div>
    );
  }

  const currentAc = items[currentIndex];
  const isOn = currentAc.status === 'ENLIGNE';
  const temperature = currentAc.temperatureCible || 25;
  const mode = currentAc.mode || 'AUTO'; 

  const nextAc = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevAc = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const updateAcProperty = (property, value) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentAc._id || currentAc.id, {
        ...currentAc,
        [property]: value
      });
    }
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateAcProperty('status', nextStatus);
  };

  const incrementTemp = () => {
    if (temperature < 30) updateAcProperty('temperatureCible', temperature + 1);
  };

  const decrementTemp = () => {
    if (temperature > 16) updateAcProperty('temperatureCible', temperature - 1);
  };

  const changeMode = (newMode) => {
    updateAcProperty('mode', newMode); 
  };

  return (
    <div className={`relative w-full max-w-[860px] h-[230px] bg-[#f4ebe1] rounded-[45px] p-6 shadow-xl flex flex-col justify-between transition-all duration-500 select-none ${className}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Wind size={20} className="text-gray-700" />
            <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
              {currentAc.nomAppareil || 'Climatiseur'}
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
          <button className="text-gray-700 hover:bg-black/5 p-1 rounded-full transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* CONTENU CENTRAL (Alignement horizontal parfait) */}
      <div className="flex items-center justify-between w-full h-full mt-2 relative">
        <button 
          onClick={prevAc} 
          className={`p-1.5 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <div className="flex-1 grid grid-cols-3 items-center justify-items-center h-full px-2">
          
          {/* 1. Image */}
          <div className="relative w-full max-w-[130px] flex items-center justify-center">
            <img 
              src={acImage} 
              alt="Climatiseur" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 drop-shadow-md' : 'opacity-30'}`} 
            />
          </div>

          {/* 2. Thermostat Rond */}
          <div className={`relative w-28 h-28 flex items-center justify-center transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-300/40 flex items-center justify-center">
              <div 
                className="absolute w-full h-full rounded-full transition-transform duration-300"
                style={{ transform: `rotate(${(temperature - 16) * 15}deg)` }}
              >
                <div className="w-2.5 h-2.5 bg-gray-800 rounded-full absolute -top-1.5 left-[45%]" />
              </div>
            </div>

            <div className="z-10 flex flex-col items-center justify-center bg-[#f4ebe1] rounded-full w-22 h-22 shadow-inner">
              <span className="text-xl font-black text-gray-800">{temperature}°C</span>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={decrementTemp} className="p-0.5 bg-white hover:bg-gray-100 rounded shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-all">
                  <Minus size={10} />
                </button>
                <button onClick={incrementTemp} className="p-0.5 bg-white hover:bg-gray-100 rounded shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-all">
                  <Plus size={10} />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Les Modes Horizontaux */}
          <div className={`flex flex-row gap-2 justify-center w-full transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            {['AUTO', 'FROID', 'CHAUD'].map((m) => (
              <button 
                key={m}
                onClick={() => changeMode(m)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all ${mode === m ? 'bg-white border-white shadow-md' : 'bg-transparent border-transparent hover:bg-black/5'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${m === 'FROID' && mode === m ? 'bg-blue-100 text-blue-600' : m === 'CHAUD' && mode === m ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                  {m === 'AUTO' && <Settings size={14} />}
                  {m === 'FROID' && <Snowflake size={14} />}
                  {m === 'CHAUD' && <Flame size={14} />}
                </div>
                <span className="text-[9px] font-bold text-gray-700 mt-1">{m}</span>
              </button>
            ))}
          </div>

        </div>

        <button 
          onClick={nextAc} 
          className={`p-1.5 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default AirConditionerCard;