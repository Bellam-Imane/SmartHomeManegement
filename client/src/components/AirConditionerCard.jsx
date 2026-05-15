import React, { useState } from 'react';
import { 
  Wind, MoreVertical, ChevronLeft, ChevronRight, Plus, Minus, 
  Settings, Snowflake, Flame 
} from 'lucide-react';
import acImage from '../assets/images/climatiseur.png'; // L'image du climatiseur blanc

/**
 * COMPOSANT AIRCONDITIONERCARD : Contrôle du système de climatisation Smart Home
 */
const AirConditionerCard = ({ acData }) => {

  // 1. SÉCURITÉ : Gestion des données si la liste est vide pour éviter les erreurs
  if (!acData || acData.length === 0) {
    return (
      <div className="w-full max-w-[850px] h-[220px] rounded-[35px] bg-[#f4ebe1] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des climatiseurs...
      </div>
    );
  }

  // 2. GESTION DE LA NAVIGATION : Index du climatiseur actif (ex: Salon, Chambre)
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentAc = acData[currentIndex];

  // 3. ÉTATS LOCAUX : Synchronisés avec les fonctionnalités du climatiseur
  const [isOn, setIsOn] = useState(currentAc.status === 'ENLIGNE');
  const [temperature, setTemperature] = useState(currentAc.temperature || 25);
  const [mode, setMode] = useState(currentAc.modeActuel || 'auto'); // Valeurs : auto, refroidissement, chauffage

  // Fonctions de navigation entre les appareils
  const nextAc = () => {
    setCurrentIndex((prev) => (prev === acData.length - 1 ? 0 : prev + 1));
  };

  const prevAc = () => {
    setCurrentIndex((prev) => (prev === 0 ? acData.length - 1 : prev - 1));
  };

  // Fonctions pour augmenter / diminuer la température (Limites sûres : 16°C à 30°C)
  const incrementTemp = () => {
    if (temperature < 30) setTemperature(prev => prev + 1);
  };

  const decrementTemp = () => {
    if (temperature > 16) setTemperature(prev => prev - 1);
  };

  return (
    <div className="relative w-full max-w-[880px] bg-[#f4ebe1] rounded-[40px] p-6 shadow-lg flex flex-col justify-between min-h-[240px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Wind size={22} className="text-gray-700" />
            <h3 className="text-xl font-bold text-gray-800">{currentAc.nomAppareil || 'Climatiseur'}</h3>
          </div>
          {/* Sous-titre dynamique indiquant le nombre d'appareils */}
          <span className="text-xs text-gray-400 font-medium ml-8">
            {acData.length} appareils disponibles
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Interrupteur principal ON/OFF */}
          <button 
            onClick={() => setIsOn(!isOn)}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-1' : 'left-1'}`} />
          </button>
          {/* Bouton Menu d'options (Trois points) */}
          <button className="text-gray-700 hover:bg-black/5 p-1 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* ================= SECTION CONTENU : IMAGE, THERMOSTAT & MODES ================= */}
      <div className="flex items-center justify-between w-full mt-4 relative px-2">
        
        {/* Flèche de navigation Gauche */}
        <button onClick={prevAc} className="p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        {/* Zone centrale principale répartie en 3 colonnes */}
        <div className="flex-1 grid grid-cols-3 items-center justify-items-center gap-4 px-4">
          
          {/* 1ère Colonne : Image du climatiseur physique */}
          <div className="relative w-full max-w-[180px] flex items-center justify-center">
            <img 
              src={acImage} 
              alt="Climatiseur" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 drop-shadow-md' : 'opacity-40 brightness-95'}`} 
            />
            {/* Affichage digital de la température sur le plastique si l'appareil est allumé */}
            {isOn && (
              <span className="absolute top-[38%] text-[10px] font-bold text-white/80 tracking-tighter animate-pulse">
                {temperature}
              </span>
            )}
          </div>

          {/* 2ème Colonne : Thermostat Circulaire Visuel */}
          <div className={`relative w-36 h-36 flex items-center justify-center transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            {/* Cadran circulaire avec les encoches de température */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-300/40 flex items-center justify-center">
              {/* Indicateur rotatif visuel (Curseur noir simulé) */}
              <div 
                className="absolute w-full h-full rounded-full transition-transform duration-300"
                style={{ transform: `rotate(${(temperature - 16) * 15}deg)` }}
              >
                <div className="w-2.5 h-2.5 bg-black rounded-full absolute -top-1 left-[47%]" />
              </div>
            </div>

            {/* Centre du Thermostat : Température actuelle et boutons +/- */}
            <div className="z-10 flex flex-col items-center justify-center bg-[#f4ebe1] rounded-full w-28 h-28 shadow-inner">
              <span className="text-2xl font-black text-gray-800">{temperature}°C</span>
              
              {/* Boutons de contrôle précis de la température */}
              <div className="flex items-center gap-3 mt-1">
                <button 
                  onClick={decrementTemp}
                  className="p-1 bg-white hover:bg-gray-100 rounded-md shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-transform"
                >
                  <Minus size={12} />
                </button>
                <button 
                  onClick={incrementTemp}
                  className="p-1 bg-white hover:bg-gray-100 rounded-md shadow-sm border border-gray-200 text-gray-600 active:scale-90 transition-transform"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* 3ème Colonne : Sélecteur de Modes Verticaux (Auto, Froid, Chaud) */}
          <div className={`flex flex-col gap-3 w-full max-w-[160px] transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            
            {/* Mode 1 : Automatique */}
            <button 
              onClick={() => setMode('auto')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'auto' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                <Settings size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">auto</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

            {/* Mode 2 : Refroidissement (Froid) */}
            <button 
              onClick={() => setMode('refroidissement')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'refroidissement' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 bg-blue-100/60">
                <Snowflake size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">refroidissement</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

            {/* Mode 3 : Chauffage (Chaud) */}
            <button 
              onClick={() => setMode('chauffage')}
              className={`flex items-center gap-3 w-full px-3 py-1.5 rounded-xl border transition-all ${mode === 'chauffage' ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
            >
              <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 bg-orange-100/60">
                <Flame size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-black text-gray-700 leading-none">chauffage</span>
                <span className="text-[9px] text-gray-400 font-medium">Mode</span>
              </div>
            </button>

          </div>

        </div>

        {/* Flèche de navigation Droite */}
        <button onClick={nextAc} className="p-2 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0">
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>
      
    </div>
  );
};

export default AirConditionerCard;