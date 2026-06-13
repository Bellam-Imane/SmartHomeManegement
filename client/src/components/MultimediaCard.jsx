import React, { useState, useEffect } from 'react';
import { 
  Tv, MoreVertical, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  ChevronUp, ChevronDown, Clock, Radio, Music, Play, Pause
} from 'lucide-react';
import tvImage from '../assets/images/tv_image.png';

/**
 * COMPOSANT MULTIMEDIACARD
 * Interface de contrôle pour les téléviseurs connectés.
 * Intègre la gestion du volume, du changement d'applications, des chaînes,
 * de l'état Lecture/Pause, et le calcul dynamique du temps de visionnage.
 */
const MultimediaCard = ({ multimediaData, onUpdateAppareil, className = '' }) => {
  
  // Sécurisation des données reçues sous forme de tableau
  const items = Array.isArray(multimediaData) ? multimediaData : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tempsAffiche, setTempsAffiche] = useState(0);

  // Sécurité pour réinitialiser l'index si le tableau d'appareils change
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Sélection du téléviseur actuellement affiché
  const currentTv = items[currentIndex];

  /**
   * ⏱️ EFFET : Calcul dynamique du temps de visionnage accumulé en direct
   * Si l'appareil est allumé (ENLIGNE), on ajoute les minutes écoulées depuis 
   * le 'dernierAllumage' au cumul total stocké en Base de Données.
   */
  useEffect(() => {
    if (!currentTv) return;

    let interval;
    const totalBase = currentTv.tempsUtilisationTotal || 0;

    if (currentTv.status === 'ENLIGNE' && currentTv.dernierAllumage) {
      const calculerTempsEnDirect = () => {
        const maintenant = new Date();
        const debut = new Date(currentTv.dernierAllumage);
        const differenceMs = maintenant - debut;
        
        // Conversion de la différence de millisecondes en minutes
        const minutesEnDirect = Math.round(differenceMs / 1000 / 60); 
        
        // Mise à jour de l'état : Cumul BDD + Minutes en temps réel
        setTempsAffiche(totalBase + minutesEnDirect);
      };

      // Exécution immédiate au montage, puis actualisation toutes les minutes (60000 ms)
      calculerTempsEnDirect();
      interval = setInterval(calculerTempsEnDirect, 60000); 
    } else {
      // Si la TV est éteinte, on affiche simplement la valeur statique de la BDD
      setTempsAffiche(totalBase);
    }

    // Nettoyage de l'intervalle pour éviter les fuites de mémoire
    return () => clearInterval(interval);
  }, [currentTv?.status, currentTv?.dernierAllumage, currentTv?.tempsUtilisationTotal]);

  // Message d'attente si aucune donnée n'est encore chargée
  if (items.length === 0) {
    return (
      <div className="w-full max-w-[400px] h-full rounded-[45px] bg-[#e2e8f0] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des appareils multimédia...
      </div>
    );
  }

  // Extraction des propriétés d'état du téléviseur actuel (Sécurisé contre les valeurs undefined)
  const isOn = currentTv?.status === 'ENLIGNE';
  const volume = currentTv?.volume !== undefined ? currentTv.volume : 50;
  const estMuet = currentTv?.estMuet || false;
  const appActive = currentTv?.application || 'NONE'; 
  const channel = currentTv?.chaineActuelle || 1;
  const estEnLecture = currentTv?.lectureActive !== undefined ? currentTv.lectureActive : true;

  /**
   * 📊 FONCTION UTILITAIRE : Formate les minutes en heures et minutes (ex: 75 -> 1h 15min)
   */
  const formaterTemps = (minutes) => {
    if (!minutes || minutes === 0) return "0 min";
    const heures = Math.floor(minutes / 60);
    const minsRestantes = minutes % 60;
    return heures > 0 ? `${heures}h ${minsRestantes}min` : `${minsRestantes} min`;
  };

  /**
   * 🌐 FONCTION COMMUNE : Envoie les mises à jour au composant parent (Backend / MQTT)
   */
  const updateTvProperty = (updates) => {
    if (onUpdateAppareil && currentTv) {
      onUpdateAppareil(currentTv._id || currentTv.id, updates);
    }
  };

  // Navigation : Passage au téléviseur suivant
  const nextTv = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Navigation : Retour au téléviseur précédent
  const prevTv = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Gestion de l'alimentation (ON / OFF)
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateTvProperty({ status: nextStatus });
  };

  // Gestion du volume via la barre de glissement (Slider)
  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    updateTvProperty({ volume: val, estMuet: val === 0 ? true : estMuet });
  };

  // Ajustement du volume par paliers de 5% via le Pad directionnel
  const adjustVolumeSteps = (direction) => {
    if (!isOn) return;
    let newVolume = direction === 'UP' ? volume + 5 : volume - 5;
    newVolume = Math.max(0, Math.min(100, newVolume)); // Borne entre 0 et 100%
    updateTvProperty({ volume: newVolume, estMuet: newVolume === 0 ? true : false });
  };

  // Gestion du bouton central OK : Alterne entre Lecture (Play) et Pause
  const handleOkClick = () => {
    if (!isOn) return;
    updateTvProperty({ lectureActive: !estEnLecture });
  };

  // Activation / Désactivation du mode Muet (Mute)
  const toggleMute = () => {
    if (!isOn) return;
    updateTvProperty({ estMuet: !estMuet });
  };

  // Changement d'application (Active l'application sélectionnée ou revient à l'état NONE)
  const handleAppChange = (appName) => {
    if (!isOn) return;
    const nextApp = appActive === appName ? 'NONE' : appName;
    updateTvProperty({ application: nextApp, lectureActive: true });
  };

  // Changement de chaîne de télévision (Incrémentation / Décrémentation)
  const changeChannel = (direction) => {
    if (!isOn) return;
    const nextChannel = direction === 'UP' ? channel + 1 : Math.max(1, channel - 1);
    updateTvProperty({ chaineActuelle: nextChannel });
  };

  return (
    <div className={`relative w-full max-w-[420px] bg-[#e2ecf6] rounded-[45px] p-6 shadow-xl flex flex-col justify-between h-full transition-all duration-500 select-none ${className}`}>
      
      {/* ─── EN-TÊTE DE LA CARDE (Nom et État de l'appareil) ─── */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <Tv size={24} className="text-gray-700" />
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold text-gray-800 leading-tight">
              {currentTv?.nomAppareil || 'Téléviseur'}
            </h3>
            <span className="text-[11px] text-gray-500 font-bold tracking-tight mt-0.5">
              {items.length} appareils connectés
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Commutateur visuel ON/OFF */}
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

      {/* ─── SECTION CENTRALE (Aperçu de l'Écran et Jauge de Volume) ─── */}
      <div className="flex items-center justify-between my-4 relative h-48 px-1">
        {/* Navigation Gauche */}
        <button 
          onClick={prevTv} 
          className={`p-2 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0 ${items.length <= 1 ? 'opacity-30 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={28} className="text-gray-600" />
        </button>

        <div className="relative flex items-center justify-center w-full gap-4 px-2">
          {/* Écran TV et Indicateurs d'Applications */}
          <div className="relative flex-1 max-w-[320px] flex items-center justify-center">
            <img 
              src={tvImage} 
              alt="Écran TV" 
              className={`w-full h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 brightness-100' : 'opacity-10 brightness-[0.15]'}`} 
            />
            {/* Superposition des infos média si la TV est allumée */}
            {isOn && appActive !== 'NONE' && (
              <div className="absolute top-[10%] left-0 right-0 bottom-[20%] flex flex-col items-center justify-center gap-1.5">
                <span className="text-white text-[10px] font-black tracking-widest bg-black/70 px-2 py-0.5 rounded-md uppercase">
                  {appActive === 'TV' ? 'Mode Chaînes' : appActive}
                </span>
                {/* Icône dynamique Play/Pause sur l'écran */}
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

          {/* Jauge et Contrôle Vertical du Volume */}
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

        {/* Navigation Droite */}
        <button 
          onClick={nextTv} 
          className={`p-2 hover:bg-black/5 rounded-full transition-colors z-20 shrink-0 ${items.length <= 1 ? 'opacity-30 pointer-events-none' : ''}`}
        >
          <ChevronRight size={28} className="text-gray-600" />
        </button>
      </div>

      {/* ─── PIED DE PAGE : INTERFACE TÉLÉCOMMANDE (Désactivée si TV éteinte) ─── */}
      <div className={`w-full bg-white/90 backdrop-blur-xl rounded-[35px] p-4 shadow-inner border border-white/60 flex flex-col gap-3 transition-opacity duration-300 ${!isOn && 'opacity-40 pointer-events-none'}`}>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Pad directionnel (Volume & Chaînes) */}
          <div className="flex flex-col items-center justify-center">
            <button onClick={() => changeChannel('UP')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
              <ChevronUp size={18} />
            </button>
            <div className="flex items-center gap-2 my-1">
              <button onClick={() => adjustVolumeSteps('DOWN')} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors active:scale-95">
                <ChevronLeft size={18} />
              </button>
              {/* Bouton central OK / Lecture-Pause dynamique */}
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

          {/* Raccourcis d'Applications et Statistiques de Visionnage */}
          <div className="flex flex-col justify-between space-y-2">
            {/* Sélecteur rapide de chaînes */}
            <div className="flex items-center justify-between bg-gray-100/80 rounded-xl px-2 py-1">
              <button onClick={() => changeChannel('UP')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronUp size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700">Ch. {channel}</span>
              <button onClick={() => changeChannel('DOWN')} className="p-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Boutons d'applications multimédia (TV, YouTube, Netflix, Spotify) */}
            <div className="flex items-center justify-start gap-2">
              <button onClick={() => handleAppChange('TV')} className={`w-7 h-7 rounded-full bg-[#3a6351] flex items-center justify-center text-white border ${appActive === 'TV' ? 'border-white ring-2 ring-emerald-600/20' : 'border-transparent'}`}><Radio size={12} /></button>
              <button onClick={() => handleAppChange('YOUTUBE')} className={`w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs border ${appActive === 'YOUTUBE' ? 'border-white ring-2 ring-red-600/20' : 'border-transparent'}`}>▶</button>
              <button onClick={() => handleAppChange('NETFLIX')} className={`w-7 h-7 rounded-full bg-black flex items-center justify-center font-black text-[9px] text-red-600 border ${appActive === 'NETFLIX' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-transparent'}`}>N</button>
              <button onClick={() => handleAppChange('SPOTIFY')} className={`w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center text-white border ${appActive === 'SPOTIFY' ? 'border-white ring-2 ring-green-500/20' : 'border-transparent'}`}><Music size={12} /></button>
            </div>

            {/* ⏱️ Bloc d'affichage du Temps Cumulé accumulé en direct */}
            <div className="flex items-center justify-center gap-1.5 p-1 border-t border-gray-100 pt-2 w-full">
              <Clock size={12} className={`text-gray-400 ${isOn ? 'text-blue-500 animate-pulse' : ''}`} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-gray-700 leading-tight">
                  {formaterTemps(tempsAffiche)}
                </span>
                <span className="text-[8px] text-gray-400 font-medium tracking-tighter">
                  Temps visionné
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Exportation par défaut pour une intégration fluide dans RoomDetails.jsx
export default MultimediaCard;