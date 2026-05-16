import React, { useState, useEffect } from 'react';
import { 
  Blinds, MoreVertical, ChevronLeft, ChevronRight, Moon, Sun, 
  ShieldCheck, Clapperboard, Sparkles
} from 'lucide-react';

/**
 * COMPOSANT CURTAINSCARD
 * Je gère ici l'ouverture motorisée de mes rideaux en assurant une synchronisation totale avec mon parent.
 */
const CurtainsCard = ({ appareil, curtainsData, onUpdateAppareil }) => {

  // Étape 1 : Sécurisation de la structure des données.
  // Si mon parent me passe un "appareil" unique, je le transforme en tableau pour ne pas casser mes flèches.
  // Sinon, j'utilise directement le tableau "curtainsData".
  const items = curtainsData || (appareil ? [appareil] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState('Ombrage automatique');

  // Je surveille mon index pour éviter tout débordement hors du tableau si les données changent
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Si aucun appareil n'est chargé, j'affiche mon écran de sécurité
  if (items.length === 0) {
    return (
      <div className="w-full max-w-[880px] min-h-[260px] rounded-[40px] bg-[#e6f2fe] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des rideaux...
      </div>
    );
  }

  // Sélection de mon rideau actuellement affiché
  const currentCurtain = items[currentIndex];

  // Extraction directe des valeurs sans state local pour rester parfaitement "Controlled"
  const isOn = currentCurtain.status === 'ENLIGNE';
  const pourcentage = currentCurtain.pourcentageOuverture || 0; // Aligné sur mon schéma Mongoose [0 à 100]

  // Fonctions de navigation entre mes différents rideaux
  const nextCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Ma fonction de notification pour envoyer toutes les modifications en direct à "RoomDetails"
  const updateCurtainProperty = (property, value) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
        ...currentCurtain,
        [property]: value
      });
    }
  };

  // Switch d'alimentation principale (status: 'ENLIGNE' / 'HORSLIGNE')
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateCurtainProperty('status', nextStatus);
  };

  // Capture des mouvements de mon slider personnalisé
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    updateCurtainProperty('pourcentageOuverture', value);
  };

  // Gestion des modes intelligents : j'applique les pourcentages prédéfinis directement en base de données
  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    if (!isOn) return; // Bloqué si l'appareil est hors ligne
    
    switch(modeId) {
      case 'Veille': updateCurtainProperty('pourcentageOuverture', 0); break;
      case 'Réveil': updateCurtainProperty('pourcentageOuverture', 100); break;
      case 'Cinema': updateCurtainProperty('pourcentageOuverture', 20); break;
      case 'Ombrage automatique': updateCurtainProperty('pourcentageOuverture', 60); break;
      default: break;
    }
  };

  const modesList = [
    { id: 'Veille', label: 'Veille', icon: <Moon size={14} /> },
    { id: 'Réveil', label: 'Réveil', icon: <Sun size={14} /> },
    { id: 'Ombrage automatique', label: 'Ombrage automatique', icon: <ShieldCheck size={14} /> },
    { id: 'Cinema', label: 'Cinema', icon: <Clapperboard size={14} /> },
  ];

  return (
    <div className="relative w-full max-w-[880px] bg-[#ebf5ff] rounded-[40px] p-6 shadow-lg flex flex-col justify-between min-h-[280px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex items-center gap-2">
          <Blinds size={22} className="text-gray-700" />
          <h3 className="text-xl font-bold text-gray-800">Rideaux</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Interrupteur principal ON/OFF */}
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

      {/* ================= SECTION CONTENU CENTRAL : TITRE & SLIDER ================= */}
      <div className={`w-full flex flex-col mt-3 px-2 transition-opacity duration-300 ${!isOn && 'opacity-40 pointer-events-none'}`}>
        <h4 className="text-base font-bold text-gray-800 mb-1 ml-10">
          {currentCurtain.nomAppareil || `Rideau ${currentIndex + 1}`}
        </h4>

        <div className="flex items-center justify-between w-full relative">
          {/* Flèche gauche masquée s'il n'y a qu'un seul rideau */}
          <button 
            onClick={prevCurtain} 
            className={`p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>

          {/* Zone du Slider de pourcentage */}
          <div className="flex-1 flex flex-col items-center px-6 relative">
            <span className="text-xs font-black text-gray-700 mb-1">
              Ouverture : {pourcentage}%
            </span>
            
            <div className="w-full relative flex items-center h-2 bg-gray-300 rounded-full">
              <div 
                className="absolute left-0 h-full bg-[#2c3e50] rounded-full"
                style={{ width: `${pourcentage}%` }}
              />
              <input 
                type="range"
                min="0"
                max="100"
                value={pourcentage}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div 
                className="absolute w-4 h-4 bg-white border-2 border-[#2c3e50] rounded-full shadow-md transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${pourcentage}%` }}
              />
            </div>
          </div>

          {/* Flèche droite */}
          <button 
            onClick={nextCurtain} 
            className={`p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* ================= SECTION MODES INTERACTIFS ================= */}
      <div className={`grid grid-cols-4 gap-4 w-full px-10 mt-4 transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
        {modesList.map((item) => (
          <button
            key={item.id}
            onClick={() => handleModeChange(item.id)}
            className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-xl border transition-all ${activeMode === item.id ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${activeMode === item.id ? 'bg-[#ebf5ff] text-blue-600' : 'bg-white text-gray-500 shadow-xs'}`}>
              {item.icon}
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[10px] font-black text-gray-700 truncate leading-none">{item.label}</span>
              <span className="text-[8px] text-gray-400 font-medium">Mode</span>
            </div>
          </button>
        ))}
      </div>

      {/* ================= SECTION FOOTER : SUGGESTION IA ================= */}
      <div className="w-full mt-5 pt-2 border-t border-gray-200/50 flex items-center gap-2 px-10 text-gray-700">
        <Sparkles size={14} className="text-blue-500 shrink-0" />
        <p className="text-[11px] font-semibold text-gray-600 tracking-wide">
          Suggestion IA : Ajuster l'ouverture pour optimiser la luminosité et économiser de l'énergie.
        </p>
      </div>
      
    </div>
  );
};

export default CurtainsCard;