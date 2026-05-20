import React, { useState, useEffect } from 'react';
import { 
  Eye, Radio, Video, VideoOff, ChevronLeft, ChevronRight, 
  MoreVertical, Maximize2, X 
} from 'lucide-react';

/**
 * COMPOSANT CAMERACARD
 */
const CameraCard = ({ cameraData, imageSrc, onUpdateAppareil, className = '' }) => {
  
  // Assurer que les données reçues sont sous forme de tableau
  const items = Array.isArray(cameraData) ? cameraData : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // Mode plein écran

  // Sécurisation de l'index en cas de changement dynamique des données
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Rendu temporaire si aucune caméra n'est disponible
  if (items.length === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto h-full rounded-[45px] bg-[#B5B8C4] flex items-center justify-center shadow-xl">
        <p className="text-gray-700 font-bold italic animate-pulse">
          Chargement du flux vidéo...
        </p>
      </div>
    );
  }

  // Sélection de la caméra courante
  const currentCamera = items[currentIndex];

  // Extraction propre des propriétés
  const { _id, id, nomAppareil, status, estEnregistrement, resolution } = currentCamera;
  const isOn = status === 'ENLIGNE';

  // Fonctions de navigation entre les caméras
  const nextCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Notification pour modifier un attribut spécifique (Optimisé et sécurisé avec typeAppareil)
  const toggleProperty = (property, currentValue) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        typeAppareil: 'CAMERA', // 🔌 INDISPENSABLE : Pour que le backend active le MQTT de la caméra
        [property]: !currentValue
      });
    }
  };

  // Switch d'alimentation centralisé (Sécurisé avec typeAppareil)
  const togglePower = () => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        typeAppareil: 'CAMERA', // 🔌 INDISPENSABLE : Transmis pour réveiller le contrôleur MQTT
        status: isOn ? 'HORSLIGNE' : 'ENLIGNE'
      });
    }
  };

  return (
    <>
      {/* ================= CARD STANDARD CONTROLLER ================= */}
      <div className={`relative w-full max-w-md mx-auto h-full rounded-[45px] overflow-hidden shadow-2xl group bg-gray-900 flex flex-col justify-between pb-4 transition-all duration-300 select-none ${className}`}>
        
        {/* 1. VISUEL */}
        <img 
          src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"} 
          alt={nomAppareil || "Caméra"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isOn ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale brightness-50'
          }`}
        />

        {/* 2. OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

        {/* 3. NAVIGATION & BARRE D'ACTION (HEADER) */}
        <div className="relative pt-4 px-5 flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={prevCamera} 
              className={`p-1 bg-black/40 text-white backdrop-blur-md rounded-full hover:bg-black/60 transition-colors ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-[10px] text-white/90 font-black tracking-wide bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full uppercase">
              {items.length} CAM
            </span>

            <button 
              onClick={nextCamera} 
              className={`p-1 bg-black/40 text-white backdrop-blur-md rounded-full hover:bg-black/60 transition-colors ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Boutons d'action droite : Agrandir + Options */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="text-white bg-black/30 backdrop-blur-xs hover:bg-black/50 p-1.5 rounded-full transition-colors"
              title="Agrandir la caméra"
            >
              <Maximize2 size={14} />
            </button>
            <button className="text-white bg-black/30 backdrop-blur-xs hover:bg-black/50 p-1.5 rounded-full transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>

        {/* 4. INFORMATIONS TEXTUELLES HAUTES */}
        <div className="relative text-center px-5 mt-1 z-10 flex flex-col items-center">
          <h3 className="text-white drop-shadow-md text-xl font-bold tracking-tight line-clamp-1">
            {nomAppareil || "Caméra"}
          </h3>
          <p className="text-white/60 text-[9px] font-bold uppercase tracking-[2px] mt-0.5">
            {resolution || 'Ultra HD 4K'}
          </p>
          {!isOn && (
            <span className="inline-block mt-1 bg-black/60 text-gray-400 text-[8px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
              Hors-ligne
            </span>
          )}
        </div>

        {/* 5. BADGES INDICATION RE-POSITIONNÉS */}
        <div className="relative flex-1 flex items-end px-5 mb-2 z-10 justify-between">
          {isOn ? (
            <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-lg flex items-center gap-1">
              <Radio className="text-red-500 animate-pulse" size={12} />
              <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter">Live</span>
            </div>
          ) : <div />}

          {isOn && estEnregistrement && (
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 shadow-lg">
              <div className="w-1 h-1 bg-white rounded-full animate-ping" />
              REC
            </div>
          )}
        </div>

        {/* 6. PANEL DES BOUTONS D'ACTION (BAS) */}
        <div className="relative flex flex-col gap-1.5 px-5 z-10 w-full">
          {isOn && (
            <button 
              onClick={() => toggleProperty('estEnregistrement', estEnregistrement)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-[15px] text-[11px] font-bold transition-all shadow-md ${
                estEnregistrement ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
              }`}
            >
              {estEnregistrement ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
            </button>
          )}
          <button 
            onClick={togglePower}
            className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-[18px] shadow-xl transition-all transform hover:scale-[1.01] active:scale-95 ${
              isOn ? 'bg-white text-gray-950 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isOn ? <VideoOff size={16} /> : <Video size={16} />}
            <span className="font-bold text-xs">
              {isOn ? 'Éteindre la caméra' : 'Visualiser en direct'}
            </span>
          </button>
        </div>
      </div>

      {/* ================= VISUELS FULLSCREEN (MODAL DE GRAND FORMAT) ================= */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-6xl aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-gray-950">
            <img 
              src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=90"} 
              alt={nomAppareil}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isOn ? 'opacity-100' : 'opacity-10 brightness-50'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <button 
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white backdrop-blur-md rounded-full hover:bg-black/70 transition-all font-bold text-sm active:scale-95"
              >
                <ChevronLeft size={18} />
                <span>Retour à la pièce</span>
              </button>
              <div className="text-right">
                <h2 className="text-white text-xl font-black tracking-tight drop-shadow-sm">{nomAppareil}</h2>
                <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase">{resolution || 'Ultra HD 4K'}</p>
              </div>
            </div>
            <div className="absolute top-24 left-6 flex gap-3 z-10">
              {isOn && (
                <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-red-600 uppercase">Flux en direct</span>
                </div>
              )}
              {isOn && estEnregistrement && (
                <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide shadow-md flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  ENREGISTREMENT EN COURS
                </div>
              )}
            </div>
            <div className="absolute bottom-6 inset-x-6 flex justify-between items-center z-10">
              <span className="text-white/40 text-xs font-mono font-medium">
                {isOn ? 'SYSTEM STATUS: OPERATIONAL' : 'SYSTEM STATUS: OFFLINE'}
              </span>
              <div className="flex items-center gap-3">
                {isOn && (
                  <button 
                    onClick={() => toggleProperty('estEnregistrement', estEnregistrement)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-md transition-all ${
                      estEnregistrement ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                    }`}
                  >
                    {estEnregistrement ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  </button>
                )}
                <button 
                  onClick={togglePower}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black shadow-md transition-all ${
                    isOn ? 'bg-white text-gray-950 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isOn ? 'Éteindre la caméra' : 'Allumer la caméra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraCard;