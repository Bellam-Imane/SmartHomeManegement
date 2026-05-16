import React, { useState, useEffect } from 'react';
import { 
  Tv, MoreVertical, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  ChevronUp, ChevronDown, Clock, Sun, Radio
} from 'lucide-react';
import tvImage from '../assets/images/tv_image.png';

/**
 * COMPOSANT MULTIMEDIACARD 
 */
const MultimediaCard = ({ multimediaData, onUpdateAppareil }) => {
  
  // 1. SÉCURITÉ : Vérification des données
  if (!multimediaData || multimediaData.length === 0) {
    return (
      <div className="w-full max-w-[400px] aspect-square rounded-[45px] bg-[#e2e8f0] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des appareils multimédia...
      </div>
    );
  }

  // 2. GESTION DE LA NAVIGATION
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTv = multimediaData[currentIndex];

  // Force le retour à l'index 0 si les données changent
  useEffect(() => {
    if (currentIndex >= multimediaData.length) {
      setCurrentIndex(0);
    }
  }, [multimediaData, currentIndex]);

  // 3. EXTRACTION EN DIRECT DE LA BASE DE DONNÉES (Conforme Mongoose)
  const isOn = currentTv.status === 'ENLIGNE';
  const volume = currentTv.volume !== undefined ? currentTv.volume : 50;
  const estMuet = currentTv.estMuet || false;
  const appActive = currentTv.application || 'NONE'; // TV, YOUTOUB, NETFLIX, SPOTIFY, NONE
  const channel = currentTv.chaineActuelle || 1;

  
  const [isMovieMode, setIsMovieMode] = useState(false);

  const nextTv = () => {
    setCurrentIndex((prev) => (prev === multimediaData.length - 1 ? 0 : prev + 1));
  };

  const prevTv = () => {
    setCurrentIndex((prev) => (prev === 0 ? multimediaData.length - 1 : prev - 1));
  };

  
  const updateTvProperty = (updates) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(currentTv._id || currentTv.id, {
        ...currentTv,
        ...updates
      });
    }
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateTvProperty({ status: nextStatus });
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    updateTvProperty({
      volume: val,
      estMuet: val === 0 ? true : estMuet 
    });
  };

  const toggleMute = () => {
    updateTvProperty({ estMuet: !estMuet });
  };

  const handleAppChange = (appName) => {
    
    const nextApp = appActive === appName ? 'NONE' : appName;
    updateTvProperty({ application: nextApp });
  };

  const changeChannel = (direction) => {
    const nextChannel = direction === 'UP' ? channel + 1 : Math.max(1, channel - 1);
    updateTvProperty({ chaineActuelle: nextChannel });
  };

  return (
    <div className="relative w-full max-w-[420px] bg-[#e2ecf6] rounded-[45px] p-6 shadow-xl flex flex-col justify-between min-h-[520px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <Tv size={24} className="text-gray-700" />
          <h3 className="text-xl font-bold text-gray-800">{currentTv.nomAppareil}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Switch On/Off */}
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

      {/* ================= SECTION CENTRALE ================= */}
      <div className="flex items-center justify-between my-4 relative h-48 px-1">
        
        <button onClick={prevTv} className="p-2 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0">
          <ChevronLeft size={28} className="text-gray-600" />
        </button>

        <div className="relative flex items-center justify-center w-full gap-4 px-2">
          
          {/* Écran de la télévision */}
          <div className="relative flex-1 max-w-[320px] flex items-center justify-center">
            <img 
              src={tvImage} 
              alt="Écran TV" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 brightness-100' : 'opacity-10 brightness-[0.15]'}`} 
            />
            {isOn && appActive !== 'NONE' && (
              <div className="absolute top-[10%] left-0 right-0 bottom-[20%] flex items-center justify-center">
                <span className="text-white text-[10px] font-black tracking-widest bg-black/70 px-2 py-0.5 rounded-md uppercase">
                  {appActive === 'TV' ? 'Mode Chaînes' : appActive}
                </span>
              </div>
            )}
          </div>

          {/* Slider de volume vertical */}
          <div className="relative w-12 h-36 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 flex flex-col justify-between items-center py-3 shrink-0">
            <span className="text-[11px] font-black text-gray-700">{estMuet ? '0%' : `${volume}%`}</span>
            <div className="w-6 h-16 bg-gray-200 rounded-full relative overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-white transition-all duration-100" 
                style={{ height: estMuet ? '0%' : `${volume}%` }}
              />
              <input 
                type="range"
                min="0"
                max="100"
                disabled={!isOn}
                value={estMuet ? 0 : volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 opacity-0 cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
              />
            </div>
            <button 
              disabled={!isOn}
              onClick={toggleMute}
              className={`text-gray-700 hover:scale-110 active:scale-95 transition-transform ${!isOn && 'opacity-30'}`}
            >
              {estMuet || volume === 0 ? <VolumeX size={18} className="text-red-500" /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        <button onClick={nextTv} className="p-2 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0">
          <ChevronRight size={28} className="text-gray-600" />
        </button>
      </div>

      {/* ================= SECTION FOOTER : TÉLÉCOMMANDE ================= */}
      <div className={`w-full bg-white/90 backdrop-blur-xl rounded-[35px] p-4 shadow-inner border border-white/60 grid grid-cols-2 gap-4 transition-opacity duration-300 ${!isOn && 'opacity-40 pointer-events-none'}`}>
        
        {/* Côté Gauche : Pavé Directionnel (D-Pad) */}
        <div className="flex flex-col items-center justify-center">
          <button onClick={() => changeChannel('UP')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
            <ChevronUp size={18} />
          </button>
          <div className="flex items-center gap-2 my-1">
            <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">
              Ok
            </button>
            <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <button onClick={() => changeChannel('DOWN')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Côté Droit : Chaînes, Applications & Stats */}
        <div className="flex flex-col justify-between space-y-2">
          
          {/* Sélecteur de Chaînes */}
          <div className="flex items-center justify-between bg-gray-100/80 rounded-xl px-2 py-1">
            <button onClick={() => changeChannel('UP')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronUp size={16} />
            </button>
            <span className="text-xs font-bold text-gray-700">Ch. {channel}</span>
            <button onClick={() => changeChannel('DOWN')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="flex items-center justify-start gap-3">
            {/* 1. Bouton TV */}
            <button 
              onClick={() => handleAppChange('TV')} 
              className={`w-7 h-7 rounded-full bg-[#3a6351] flex items-center justify-center text-white border shadow-sm transition-transform hover:scale-110 active:scale-95 ${appActive === 'TV' ? 'border-white ring-2 ring-emerald-600/20' : 'border-transparent'}`}
            >
              <Radio size={12} />
            </button>

            {/* 2. Bouton YouTube */}
            <button 
              onClick={() => handleAppChange('YOUTOUB')}
              className={`w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs border shadow-sm transition-transform hover:scale-110 active:scale-95 ${appActive === 'YOUTOUB' ? 'border-white ring-2 ring-red-600/20' : 'border-transparent'}`}
            >
              ▶
            </button>

            {/* 3. Bouton Netflix */}
            <button 
              onClick={() => handleAppChange('NETFLIX')}
              className={`w-7 h-7 rounded-full bg-black flex items-center justify-center font-black text-[9px] text-red-600 border shadow-sm transition-transform hover:scale-110 active:scale-95 ${appActive === 'NETFLIX' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'}`}
            >
              N
            </button>
          </div>

          {/* Statistiques (Movie Mode) */}
          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
            <button 
              onClick={() => setIsMovieMode(!isMovieMode)}
              className={`flex items-center gap-1.5 p-1 rounded-md transition-colors ${isMovieMode ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'bg-transparent hover:bg-gray-50'}`}
            >
              <Clock size={12} className={`transition-colors ${isMovieMode ? 'text-yellow-400' : 'text-gray-400'}`} />
              <div className="flex flex-col text-left">
                <span className={`text-[10px] font-black transition-colors ${isMovieMode ? 'text-indigo-900' : 'text-gray-700'} leading-tight`}>Movie</span>
                <span className={`text-[8px] transition-colors ${isMovieMode ? 'text-indigo-600' : 'text-gray-400'} font-medium`}>Mode</span>
              </div>
            </button>
            <div className="flex items-center gap-1.5">
              <Sun size={12} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-700 leading-tight">137 min</span>
                <span className="text-[8px] text-gray-400 font-medium tracking-tighter">Temps rest.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default MultimediaCard;