import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

import lampe from '../assets/images/lampe.png';

/**
 * COMPOSANT ECLAIRAGECARD : Alignisé 100% avec le modèle Mongoose AppareilEclairage
 */
const EclairageCard = ({ bulbsData, onUpdateAppareil }) => {
  
  // 1. SÉCURITÉ : Gestion des données si la liste est vide
  if (!bulbsData || bulbsData.length === 0) {
    return <div className="p-8 bg-gray-200 rounded-[45px] font-bold italic text-gray-500">Chargement des lampes...</div>;
  }

  // 2. GESTION DE LA NAVIGATION
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBulb = bulbsData[currentIndex];

  // Force le retour à l'index 0 si les données changent
  useEffect(() => {
    if (currentIndex >= bulbsData.length) {
      setCurrentIndex(0);
    }
  }, [bulbsData, currentIndex]);

  // 3. EXTRACTION EN DIRECT DE LA BASE DE DONNÉES
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
    <div className="relative w-full max-w-[350px] bg-[#B5B8C4] rounded-[45px] p-8 shadow-xl overflow-hidden min-h-[480px] flex flex-col justify-between transition-all duration-500 select-none">
      
      {/* 1. SECTION HEADER : Nom et Switch */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-gray-800" />
            <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
              {currentBulb.nomAppareil} 
            </h3>
          </div>
          <span className="text-[12px] text-gray-600 font-medium ml-6">
            {bulbsData.length} appareils 
          </span>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={togglePower}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* 2. SECTION CENTRALE : Navigation et Visuel */}
      <div className="flex items-center justify-between my-4 relative h-56">
        <button onClick={prevBulb} className="p-2 hover:bg-black/5 rounded-full transition-colors z-20">
          <ChevronLeft size={28} className="text-[#3A4D62]" />
        </button>

        <div className="relative flex justify-center items-center w-full">
          {/* Halo lumineux dynamique basé sur 'couleur' et 'intensite' du modèle */}
          {isOn && (
            <div 
              className="absolute w-32 h-32 rounded-full blur-[50px] transition-all duration-500"
              style={{ 
                backgroundColor: currentBulb.couleur || '#FFFFFF',
                opacity: intensity / 100 
              }}
            />
          )}
          <img 
            src={lampe} 
            alt="Lamp"
            className={`w-40 h-auto object-contain z-10 transition-all duration-500 ${isOn ? 'opacity-100' : 'opacity-90'}`}
            style={{ 
              filter: isOn 
                ? `brightness(${0.7 + (intensity / 100) * 0.3})` 
                : 'brightness(0.7)'
            }}
          />
        </div>

        <button onClick={nextBulb} className="p-2 hover:bg-black/5 rounded-full transition-colors z-20">
          <ChevronRight size={28} className="text-[#3A4D62]" />
        </button>
      </div>

      {/* 3. SECTION FOOTER : Slider d'intensité (Glassmorphism préservé) */}
      <div style={{ 
        width: '100%', 
        background: 'rgba(255, 255, 255, 0.2)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: 50, 
        height: '50px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '4px', 
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.3)' 
      }}>
        
        {/* Barre de progression blanche */}
        <div style={{
          height: '100%',
          width: `${intensity}%`, 
          background: 'white',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '15px',
          transition: 'width 0.1s linear', 
          position: 'relative',
          minWidth: intensity > 0 ? '40px' : '0%', 
          zIndex: 1
        }}>
          <Lightbulb 
            size={20} 
            color={isOn ? "#fbbf24" : "#94a3b8"} 
            style={{ flexShrink: 0 }} 
          />
        </div>

        {/* Affichage du pourcentage */}
        <span style={{ 
          position: 'absolute', 
          right: '20px', 
          color: '#1a1a2e', 
          fontSize: '14px', 
          fontWeight: 800, 
          zIndex: 2,
          pointerEvents: 'none' 
        }}>
          {intensity}%
        </span>

        {/* Input natif invisible pour le contrôle connecté */}
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