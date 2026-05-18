import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

import lampe from '../assets/images/lampe.png';

/**
 * COMPOSANT ECLAIRAGECARD : Divisé équitablement à 50% de la hauteur totale
 */
const EclairageCard = ({ bulbsData, onUpdateAppareil, className = '' }) => {
  
  if (!bulbsData || bulbsData.length === 0) {
    return <div className="p-8 bg-gray-200 rounded-[45px] font-bold italic text-gray-500">Chargement des lampes...</div>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBulb = bulbsData[currentIndex];

  useEffect(() => {
    if (currentIndex >= bulbsData.length) {
      setCurrentIndex(0);
    }
  }, [bulbsData, currentIndex]);

  const isOn = currentBulb.status === 'ENLIGNE';
  const intensity = currentBulb.intensite !== undefined ? currentBulb.intensite : 100;

  const nextBulb = () => {
    setCurrentIndex((prev) => (prev === bulbsData.length - 1 ? 0 : prev + 1));
  };

  const prevBulb = () => {
    setCurrentIndex((prev) => (prev === 0 ? bulbsData.length - 1 : prev - 1));
  };

  const updateBulbProperty = (updates) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentBulb._id || currentBulb.id, {
        ...currentBulb,
        ...updates
      });
    }
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateBulbProperty({ status: nextStatus });
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    let nextStatus = currentBulb.status;
    if (val === 0) nextStatus = 'HORSLIGNE';
    else if (val > 0 && !isOn) nextStatus = 'ENLIGNE';

    updateBulbProperty({
      intensite: val,
      status: nextStatus
    });
  };

  return (
    <div className={`relative w-full max-w-[420px] h-full bg-[#B5B8C4] rounded-[45px] p-5 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-500 select-none ${className}`}>
      
      {/* 1. SECTION HEADER */}
      <div className="flex justify-between items-start z-10 shrink-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={16} className="text-gray-800" />
            <h3 className="text-[15px] font-bold text-gray-800 tracking-tight line-clamp-1">
              {currentBulb.nomAppareil} 
            </h3>
          </div>
          <span className="text-[11px] text-gray-600 font-medium ml-5">
            {bulbsData.length} appareils 
          </span>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={togglePower}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* 2. SECTION CENTRALE (Ajustée pour hauteur 253px) */}
      <div className="flex items-center justify-between my-1 relative flex-1 min-h-[90px]">
        <button onClick={prevBulb} className="p-1 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0">
          <ChevronLeft size={24} className="text-[#3A4D62]" />
        </button>

        <div className="relative flex justify-center items-center w-full h-full">
          {/* Halo lumineux */}
          {isOn && (
            <div 
              className="absolute w-24 h-24 rounded-full blur-[30px] transition-all duration-500"
              style={{ 
                backgroundColor: currentBulb.couleur || '#FFFFFF',
                opacity: intensity / 100 
              }}
            />
          )}
          <img 
            src={lampe} 
            alt="Lamp"
            className={`w-20 h-auto max-h-[90px] object-contain z-10 transition-all duration-500 ${isOn ? 'opacity-100 scale-105' : 'opacity-90'}`}
            style={{ 
              filter: isOn 
                ? `brightness(${0.7 + (intensity / 100) * 0.3})` 
                : 'brightness(0.7)'
            }}
          />
        </div>

        <button onClick={nextBulb} className="p-1 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0">
          <ChevronRight size={24} className="text-[#3A4D62]" />
        </button>
      </div>

      {/* 3. SECTION FOOTER */}
      <div className="shrink-0" style={{ 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: 50, 
        height: '42px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '3px', 
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.3)' 
      }}>
        
        <div style={{
          height: '100%',
          width: `${intensity}%`, 
          background: 'white',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px',
          transition: 'width 0.1s linear', 
          position: 'relative',
          minWidth: intensity > 0 ? '35px' : '0%', 
          zIndex: 1
        }}>
          <Lightbulb 
            size={16} 
            color={isOn ? "#fbbf24" : "#94a3b8"} 
            style={{ flexShrink: 0 }} 
          />
        </div>

        <span style={{ 
          position: 'absolute', 
          right: '15px', 
          color: '#1a1a2e', 
          fontSize: '12px', 
          fontWeight: 800, 
          zIndex: 2,
          pointerEvents: 'none' 
        }}>
          {intensity}%
        </span>

        <input 
          type="range" 
          min="0" 
          max="100" 
          value={intensity} 
          onChange={handleSliderChange} 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            opacity: 0, 
            cursor: 'pointer', 
            zIndex: 10 
          }} 
        />  
      </div>
    </div>
  );
};

export default EclairageCard;