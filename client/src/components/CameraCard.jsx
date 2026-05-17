import React, { useState, useEffect } from 'react';
import { 
  Eye, Radio, Video, VideoOff, ChevronLeft, ChevronRight, 
  MoreVertical, Maximize2, X 
} from 'lucide-react';

/**
 * COMPOSANT CAMERACARD
 */
const CameraCard = ({ cameraData, imageSrc, onUpdateAppareil }) => {
  
  // Assurer que les donnees reçues sont sous forme de tableau
  const items = Array.isArray(cameraData) ? cameraData : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // Mode plein ecran

  // Securisation de l'index en cas de changement dynamique des donnees
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Rendu temporaire si aucune camera n'est disponible
  if (items.length === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] bg-[#B5B8C4] flex items-center justify-center shadow-xl">
        <p className="text-gray-700 font-bold italic animate-pulse">
          Chargement du flux vidéo...
        </p>
      </div>
    );
  }

  // Selection de la camera courante
  const currentCamera = items[currentIndex];

  // Extraction propre des proprietes
  const { _id, id, nomAppareil, status, estEnregistrement, resolution } = currentCamera;
  const isOn = status === 'ENLIGNE';

  // Fonctions de navigation entre les cameras
  const nextCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Notification pour modifier un attribut specifique
  const toggleProperty = (property, currentValue) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        ...currentCamera,
        [property]: !currentValue
      });
    }
  };

  // Switch d'alimentation centralise
  const togglePower = () => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        ...currentCamera,
        status: isOn ? 'HORSLIGNE' : 'ENLIGNE'
      });
    }
  };

  return (
    <>
      {/* ================= CARD STANDARD CONTROLLER ================= */}
      <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] overflow-hidden shadow-2xl group bg-gray-900 transition-all duration-300 select-none">
        
        {/* 1. VISUEL */}
        <img 
          src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"} 
          alt={nomAppareil || "Caméra"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isOn ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale brightness-50'
          }`}
        />

        {/* 2. OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        {/* 3. NAVIGATION & BARRE D'ACTION (HEADER) */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={prevCamera} 
              className={`p-1.5 bg-black/40 text-white backdrop-blur-md rounded-full hover:bg-black/60 transition-colors ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-[11px] text-white/90 font-black tracking-wide bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full uppercase">
              {items.length} appareils connectés
            </span>

            <button 
              onClick={nextCamera} 
              className={`p-1.5 bg-black/40 text-white backdrop-blur-md rounded-full hover:bg-black/60 transition-colors ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Boutons d'action droite : Agrandir + Options */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="text-white bg-black/30 backdrop-blur-xs hover:bg-black/50 p-1.5 rounded-full transition-colors"
              title="Agrandir la caméra"
            >
              <Maximize2 size={16} />
            </button>
            <button className="text-white bg-black/30 backdrop-blur-xs hover:bg-black/50 p-1.5 rounded-full transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* 4. INFORMATIONS TEXTUELLES HAUTES */}
        <div className="absolute inset-x-0 top-16 text-center px-6 z-10 flex flex-col items-center">
          <h3 className="text-white drop-shadow-md text-2xl font-bold tracking-tight">
            {nomAppareil || "Caméra de Surveillance"}
          </h3>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-[3px] mt-0.5">
            {resolution || 'Ultra HD 4K'}
          </p>
          {!isOn && (
            <span className="inline-block mt-2 bg-black/60 text-gray-400 text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
              Hors-ligne
            </span>
          )}
        </div>

        {/* 5. BADGES INDICATION RE-POSITIONNÉS */}
        <div className="absolute bottom-[170px] inset-x-6 flex justify-between items-center z-10">
          {isOn ? (
            <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
              <Radio className="text-red-500 animate-pulse" size={14} />
              <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Live</span>
            </div>
          ) : <div />}

          {isOn && estEnregistrement && (
            <div className="bg-red-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              REC
            </div>
          )}
        </div>

        {/* 6. PANEL DES BOUTONS D'ACTION (BAS) */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col gap-2 px-6 z-10">
          {isOn && (
            <button 
              onClick={() => toggleProperty('estEnregistrement', estEnregistrement)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-[20px] text-xs font-bold transition-all shadow-md ${
                estEnregistrement ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
              }`}
            >
              {estEnregistrement ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
            </button>
          )}
          <button 
            onClick={togglePower}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-[25px] shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 ${
              isOn ? 'bg-white text-gray-950 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isOn ? <VideoOff size={20} /> : <Video size={20} />}
            <span className="font-bold text-sm">
              {isOn ? 'Éteindre la caméra' : 'Visualiser en direct (Allumer)'}
            </span>
          </button>
        </div>
      </div>

      {/* ================= =================================== ================= */}
      {/* ================= VISUELS FULLSCREEN (MODAL DE GRAND FORMAT) ================= */}
      {/* ================= =================================== ================= */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          <div className="relative w-full max-w-6xl aspect-video rounded-[32px] overflow-hidden shadow-2xl bg-gray-950">
            
            {/* Flux video Grand Format */}
            <img 
              src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=90"} 
              alt={nomAppareil}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isOn ? 'opacity-100' : 'opacity-10 brightness-50'}`}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />

            {/* Header du mode plein ecran : Bouton Retour intégré */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              
              {/* زر الرجوع للغرفة الأنيق */}
              <button 
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-black/50 text-white backdrop-blur-md rounded-full hover:bg-black/70 transition-all font-bold text-sm active:scale-95"
              >
                <ChevronLeft size={18} />
                <span>Retour à la pièce</span>
              </button>

              {/* Infos Camera */}
              <div className="text-right">
                <h2 className="text-white text-xl font-black tracking-tight drop-shadow-sm">{nomAppareil}</h2>
                <p className="text-white/60 text-[10px] font-bold tracking-wider uppercase">{resolution || 'Ultra HD 4K'}</p>
              </div>
            </div>

            {/* Badges Temps Reel */}
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

            {/* Controls Bas Mode Plein Écran */}
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