import React, { useState, useEffect } from 'react';
import { 
  Tv, MoreVertical, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  ChevronUp, ChevronDown, Clock, Sun, Radio, Music, Play, Pause, Film
} from 'lucide-react';
import tvImage from '../assets/images/tv_image.png';

/**
 * COMPOSANT MULTIMEDIACARD 
 * Version optimisée : Le Mode Cinéma préserve l'application active et envoie l'état pour les volets.
 */
const MultimediaCard = ({ multimediaData, onUpdateAppareil, className = '' }) => {
  
  const items = Array.isArray(multimediaData) ? multimediaData : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  if (items.length === 0) {
    return (
      <div className="w-full max-w-[400px] h-full rounded-[45px] bg-[#e2e8f0] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des appareils multimédia...
      </div>
    );
  }

  const currentTv = items[currentIndex];
  const isOn = currentTv.status === 'ENLIGNE';
  const volume = currentTv.volume !== undefined ? currentTv.volume : 50;
  const estMuet = currentTv.estMuet || false;
  const appActive = currentTv.application || 'NONE'; 
  const channel = currentTv.chaineActuelle || 1;
  const estEnLecture = currentTv.lectureActive !== undefined ? currentTv.lectureActive : true;
  const tempsRestant = currentTv.tempsRestant !== undefined ? currentTv.tempsRestant : 120;
  const isMovieMode = currentTv.modeCinema || false;

  // Logique du minuteur réel
  useEffect(() => {
    let timer;
    if (isOn && estEnLecture && tempsRestant > 0) {
      timer = setInterval(() => {
        updateTvProperty({ tempsRestant: tempsRestant - 1 });
      }, 60000); 
    }
    return () => clearInterval(timer);
  }, [isOn, estEnLecture, tempsRestant]);

  // Envoi des modifications vers le Backend / MQTT
  const updateTvProperty = (updates) => {
    if (onUpdateAppareil && currentTv) {
      onUpdateAppareil(currentTv._id || currentTv.id, updates);
    }
  };

  const nextTv = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevTv = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateTvProperty({ status: nextStatus });
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    updateTvProperty({ volume: val, estMuet: val === 0 ? true : estMuet });
  };

  const adjustVolumeSteps = (direction) => {
    if (!isOn) return;
    let newVolume = direction === 'UP' ? volume + 5 : volume - 5;
    newVolume = Math.max(0, Math.min(100, newVolume));
    updateTvProperty({ volume: newVolume, estMuet: newVolume === 0 ? true : false });
  };

  const handleOkClick = () => {
    if (!isOn) return;
    updateTvProperty({ lectureActive: !estEnLecture });
  };

  // 🌟 ACTION MODE CINÉMA CORRIGÉE : On ne force plus Netflix !
  const handleMovieModeClick = () => {
    if (!isOn) return;
    // On envoie juste le changement d'état (true/false) au serveur
    updateTvProperty({ modeCinema: !isMovieMode });
  };

  const toggleMute = () => {
    if (!isOn) return;
    updateTvProperty({ estMuet: !estMuet });
  };

  const handleAppChange = (appName) => {
    const nextApp = appActive === appName ? 'NONE' : appName;
    updateTvProperty({ application: nextApp, lectureActive: true });
  };

  const changeChannel = (direction) => {
    const nextChannel = direction === 'UP' ? channel + 1 : Math.max(1, channel - 1);
    updateTvProperty({ chaineActuelle: nextChannel });
  };

  return (
    <div className={`relative w-full max-w-[420px] bg-[#e2ecf6] rounded-[45px] p-6 shadow-xl flex flex-col justify-between h-full transition-all duration-500 select-none ${className}`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <Tv size={24} className="text-gray-700" />
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold text-gray-800 leading-tight">
              {currentTv.nomAppareil || 'Téléviseur'}
            </h3>
            <span className="text-[11px] text-gray-500 font-bold tracking-tight mt-0.5">
              {items.length} appareils connectés
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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

      {/* SECTION CENTRALE */}
      <div className="flex items-center justify-between my-4 relative h-48 px-1">
        <button onClick={prevTv} className="p-2 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0">
          <ChevronLeft size={28} className="text-gray-600" />
        </button>

        <div className="relative flex items-center justify-center w-full gap-4 px-2">
          <div className="relative flex-1 max-w-[320px] flex items-center justify-center">
            <img 
              src={tvImage} 
              alt="Écran TV" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 brightness-100' : 'opacity-10 brightness-[0.15]'}`} 
            />
            {isOn && appActive !== 'NONE' && (
              <div className="absolute top-[10%] left-0 right-0 bottom-[20%] flex flex-col items-center justify-center gap-1.5">
                <span className="text-white text-[10px] font-black tracking-widest bg-black/70 px-2 py-0.5 rounded-md uppercase">
                  {appActive === 'TV' ? 'Mode Chaînes' : appActive}
                </span>
                <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-md flex items-center justify-center">
                  {estEnLecture ? (
                    <Play size={10} className="text-emerald-600 fill-emerald-600" />
                  ) : (
                    <Pause size={10} className="text-amber-600 fill-amber-600 animate-pulse" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Module de volume */}
          <div className="relative w-12 h-36 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 flex flex-col justify-between items-center py-3 shrink-0">
            <span className="text-[11px] font-black text-gray-700">{estMuet ? '0%' : `${volume}%`}</span>
            <div className="w-6 h-16 bg-gray-200 rounded-full relative overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-white transition-all duration-100" 
                style={{ height: estMuet ? '0%' : `${volume}%` }}
              />
              <input 
                type="range" min="0" max="100" disabled={!isOn}
                value={estMuet ? 0 : volume} onChange={handleVolumeChange}
                className="absolute inset-0 opacity-0 cursor-pointer [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
              />
            </div>
            <button 
              disabled={!isOn} onClick={toggleMute}
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

      {/* FOOTER */}
      <div className={`w-full bg-white/90 backdrop-blur-xl rounded-[35px] p-4 shadow-inner border border-white/60 flex flex-col gap-3 transition-opacity duration-300 ${!isOn && 'opacity-40 pointer-events-none'}`}>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Pad directionnel */}
          <div className="flex flex-col items-center justify-center">
            <button onClick={() => changeChannel('UP')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
              <ChevronUp size={18} />
            </button>
            <div className="flex items-center gap-2 my-1">
              <button onClick={() => adjustVolumeSteps('DOWN')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleOkClick} 
                className={`w-8 h-7 rounded-md text-[10px] font-bold transition-all flex items-center justify-center active:scale-95 border ${
                  !estEnLecture ? 'bg-gray-700 text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                {!estEnLecture ? <Play size={10} className="fill-white" /> : 'OK'}
              </button>
              <button onClick={() => adjustVolumeSteps('UP')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
                <ChevronRight size={18} />
              </button>
            </div>
            <button onClick={() => changeChannel('DOWN')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Applications & Métadonnées */}
          <div className="flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between bg-gray-100/80 rounded-xl px-2 py-1">
              <button onClick={() => changeChannel('UP')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronUp size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700">Ch. {channel}</span>
              <button onClick={() => changeChannel('DOWN')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="flex items-center justify-start gap-2">
              <button onClick={() => handleAppChange('TV')} className={`w-7 h-7 rounded-full bg-[#3a6351] flex items-center justify-center text-white border ${appActive === 'TV' ? 'border-white ring-2 ring-emerald-600/20' : 'border-transparent'}`}><Radio size={12} /></button>
              <button onClick={() => handleAppChange('YOUTUBE')} className={`w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs border ${appActive === 'YOUTUBE' ? 'border-white ring-2 ring-red-600/20' : 'border-transparent'}`}>▶</button>
              <button onClick={() => handleAppChange('NETFLIX')} className={`w-7 h-7 rounded-full bg-black flex items-center justify-center font-black text-[9px] text-red-600 border ${appActive === 'NETFLIX' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'}`}>N</button>
              <button onClick={() => handleAppChange('SPOTIFY')} className={`w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center text-white border ${appActive === 'SPOTIFY' ? 'border-white ring-2 ring-green-500/20' : 'border-transparent'}`}><Music size={12} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
              <button 
                onClick={handleMovieModeClick}
                className={`flex items-center gap-1.5 p-1 rounded-md transition-all ${isMovieMode ? 'bg-gray-100 border border-gray-300' : 'bg-transparent hover:bg-gray-50'}`}
              >
                <Film size={12} className={isMovieMode ? 'text-gray-800' : 'text-gray-400'} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-gray-700 leading-tight">Movie</span>
                  <span className="text-[8px] font-medium text-gray-400">Mode</span>
                </div>
              </button>
              
              <div className="flex items-center gap-1.5 p-1">
                <Clock size={12} className="text-gray-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-gray-700 leading-tight">{tempsRestant} min</span>
                  <span className="text-[8px] text-gray-400 font-medium tracking-tighter">Temps rest.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEXTE INTEGRE DANS LA TELECOMMANDE */}
        {isOn && isMovieMode && (
          <div className="w-full border-t border-gray-100 pt-1.5 text-[9px] text-gray-500 text-center font-medium italic">
            Ambiance Cinéma : Lumières 10% & Volets fermés.
          </div>
        )}

      </div>
    </div>
  );
};

export default MultimediaCard;