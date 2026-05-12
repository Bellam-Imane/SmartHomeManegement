import React, { useState } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';

import lampe from '../assets/images/lampe.png';

const EclairageCard = ({ bulbsData }) => {
  // Vérification de la présence des données
  if (!bulbsData || bulbsData.length === 0) {
    return <div className="p-8 bg-gray-200 rounded-[45px]">Chargement des lampes...</div>;
  }

  // État pour gérer l'index de la lampe actuelle
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentBulb = bulbsData[currentIndex];
  
  // États pour l'allumage et l'intensité
  const [isOn, setIsOn] = useState(currentBulb.status === 'ENLIGNE');
  const [intensity, setIntensity] = useState(currentBulb.intensite || 50);

  // Fonctions de navigation entre les appareils
  const nextBulb = () => {
    setCurrentIndex((prev) => (prev === bulbsData.length - 1 ? 0 : prev + 1));
  };

  const prevBulb = () => {
    setCurrentIndex((prev) => (prev === 0 ? bulbsData.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full max-w-[350px] bg-[#B5B8C4] rounded-[45px] p-8 shadow-xl overflow-hidden min-h-[480px] flex flex-col justify-between transition-all duration-500">
      
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
            onClick={() => setIsOn(!isOn)}
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
          {/* Halo lumineux dynamique */}
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
            // Opacity reste élevée (0.9) même à l'arrêt pour que l'objet soit visible
            className={`w-40 h-auto object-contain z-10 transition-all duration-500 ${isOn ? 'opacity-100' : 'opacity-90'}`}
            style={{ 
              // Luminosité ajustée : minimum 0.7 au lieu de 0.4 pour éviter l'effet "trou noir"
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

      {/* 3. SECTION FOOTER : Slider d'intensité (Glassmorphism) */}
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

        {/* Input natif invisible pour le contrôle */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={intensity} 
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setIntensity(val);
            // Gestion automatique de l'état On/Off selon l'intensité
            if (val === 0) setIsOn(false);
            else if (val > 0 && !isOn) setIsOn(true);
          }} 
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