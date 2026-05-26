import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';

import lampe from '../assets/images/lampe.png';

/**
 * COMPOSANT ECLAIRAGECARD : Divisé équitablement à 50% de la hauteur totale
 */
const EclairageCard = ({ bulbsData, onUpdateAppareil, className = '' }) => {
  
  // Validation : Affichage d'un état de chargement si aucune donnée n'est reçue
  if (!bulbsData || bulbsData.length === 0) {
    return <div className="p-8 bg-gray-200 rounded-[45px] font-bold italic text-gray-500">Chargement des lampes...</div>;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false); // État pour l'effet de transition entre les lampes
  
  const currentBulb = bulbsData[currentIndex];

  // Effet pour réinitialiser l'index si la liste des lampes change ou diminue
  useEffect(() => {
    if (currentIndex >= bulbsData.length) {
      setCurrentIndex(0);
    }
  }, [bulbsData, currentIndex]);

  // Détermination si la lampe actuelle est allumée
  const isOn = currentBulb.status === 'ENLIGNE';
  
  // Valeur réelle stockée en base (par défaut 100 si elle n'existe pas)
  const savedIntensity = currentBulb.intensite !== undefined ? currentBulb.intensite : 100;
  
  // Affichage visuel : 0% si éteint, sinon l'intensité mémorisée
  const displayIntensity = isOn ? savedIntensity : 0;

  // Passage à la lampe suivante avec animation de transition
  const nextBulb = () => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === bulbsData.length - 1 ? 0 : prev + 1));
      setIsChanging(false);
    }, 200);
  };

  // Passage à la lampe précédente avec animation de transition
  const prevBulb = () => {
    setIsChanging(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? bulbsData.length - 1 : prev - 1));
      setIsChanging(false);
    }, 200);
  };

  // Fonction centrale pour envoyer les mises à jour de l'appareil vers le parent (API Backend)
  const updateBulbProperty = (updates) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentBulb._id || currentBulb.id, {
        ...currentBulb,
        ...updates
      });
    }
  };

  // Gestion du clic sur le bouton d'alimentation (Switch)
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    
    // On garde l'intensité intacte en base pour qu'elle soit mémorisée au réallumage
    updateBulbProperty({ 
      status: nextStatus,
      intensite: savedIntensity
    });
  };

  // Gestion de la modification de la valeur du curseur (Slider)
  const handleSliderChange = (e) => {
    if (!isOn) return; // Bloquer complètement l'action si la lampe est éteinte

    const val = parseInt(e.target.value, 10);
    let nextStatus = currentBulb.status;
    
    // Si l'intensité atteint 0 via le slider, la lampe change de statut pour s'éteindre
    if (val === 0) {
      nextStatus = 'HORSLIGNE';
    }

    // Envoi de la nouvelle valeur réelle directement tapée par l'utilisateur
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
        
        {/* Actions de la lampe : Le bouton Switch puis les trois points à l'extrémité droite */}
        <div className="flex items-center gap-1">
          <button 
            onClick={togglePower}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 cursor-pointer ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-0.5' : 'left-0.5'}`} />
          </button>

          <button className="p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
            <MoreVertical size={18} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* 2. SECTION CENTRALE (Image de la lampe avec halo) */}
      <div className="flex items-center justify-between my-2 relative flex-1 min-h-[160px]">
        <button onClick={prevBulb} className="p-1 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0 cursor-pointer">
          <ChevronLeft size={24} className="text-[#3A4D62]" />
        </button>

        <div className={`relative flex justify-center items-center w-full h-full transition-all duration-300 ${isChanging ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
          {/* Halo lumineux dynamique basé sur l'intensité mémorisée */}
          {isOn && (
            <div 
              className="absolute w-44 h-44 rounded-full blur-[40px] transition-all duration-500"
              style={{ 
                backgroundColor: currentBulb.couleur || '#FFFFFF',
                opacity: (savedIntensity / 100) * 0.6
              }}
            />
          )}
          <img 
            src={lampe} 
            alt="Lamp"
            className={`w-36 h-auto max-h-[155px] object-contain z-10 transition-all duration-500 ${isOn ? 'opacity-100 scale-105' : 'opacity-75'}`}
            style={{ 
              filter: isOn 
                ? `brightness(${0.8 + (savedIntensity / 100) * 0.4})` 
                : 'brightness(0.55)'
            }}
          />
        </div>

        <button onClick={nextBulb} className="p-1 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0 cursor-pointer">
          <ChevronRight size={24} className="text-[#3A4D62]" />
        </button>
      </div>

      {/* 3. SECTION FOOTER (Contrôle de l'intensité) */}
      <div 
        className={`shrink-0 relative flex items-center p-[3px] w-full h-[42px] bg-white/20 backdrop-blur-md rounded-[50px] border border-white/30 box-sizing-border-box overflow-hidden transition-opacity duration-300 ${!isOn ? 'opacity-60' : 'opacity-100'}`}
      >
        {/* Remplissage graphique de la barre basé sur la valeur affichée (0 ou intensité) */}
        <div style={{
          height: '100%',
          width: `${displayIntensity}%`, 
          background: 'white',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px',
          transition: 'width 0.1s ease-out', 
          position: 'relative',
          minWidth: displayIntensity > 0 ? '35px' : '0%', 
          zIndex: 1
        }}>
          <Lightbulb 
            size={16} 
            color={isOn ? "#fbbf24" : "#94a3b8"} 
            style={{ flexShrink: 0 }} 
          />
        </div>

        {/* Affichage textuel du pourcentage au dessus du slider */}
        <span style={{ 
          position: 'absolute', 
          right: '15px', 
          color: '#1a1a2e', 
          fontSize: '12px', 
          fontWeight: 800, 
          zIndex: 2,
          pointerEvents: 'none' 
        }}>
          {displayIntensity}%
        </span>

        {/* Curseur HTML standard invisible superposé pour capturer les mouvements de glissement */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={savedIntensity} // Liaison obligatoire avec la valeur réelle pour un déplacement stable et précis
          onChange={handleSliderChange} 
          disabled={!isOn} // Désactivation native si la lampe est éteinte
          className={`absolute inset-0 w-full h-full opacity-0 z-10 pointer-events-auto ${isOn ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        />  
      </div>
    </div>
  );
};

export default EclairageCard;