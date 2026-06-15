import React, { useState, useEffect } from 'react';
import { 
  Eye, Radio, Video, VideoOff, ChevronLeft, ChevronRight, 
  Maximize2, X 
} from 'lucide-react';
import DeviceMenu from './DeviceMenu';

/**
 * COMPOSANT CAMERACARD
 */
const CameraCard = ({ cameraData, imageSrc, onUpdateAppareil, onEditDevice, onDeleteDevice, className = '' }) => {
  
  const items = Array.isArray(cameraData) ? cameraData : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ إصلاح dependency + حماية index
  useEffect(() => {
    if (items.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  // Loading state
  if (items.length === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto h-full rounded-[45px] bg-[#B5B8C4] flex items-center justify-center shadow-xl">
        <p className="text-gray-700 font-bold italic animate-pulse">
          Chargement du flux vidéo...
        </p>
      </div>
    );
  }

  const currentCamera = items[currentIndex] || {};

  const {
    _id,
    id,
    nomAppareil,
    status,
    estEnregistrement = false,
    resolution
  } = currentCamera;

  const isOn = status === 'ENLIGNE';

  const nextCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const prevCamera = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const toggleProperty = (property, currentValue) => {
    if (!onUpdateAppareil) return;

    onUpdateAppareil(_id || id, {
      typeAppareil: 'CAMERA',
      [property]: !currentValue
    });
  };

  const togglePower = () => {
    if (!onUpdateAppareil) return;

    onUpdateAppareil(_id || id, {
      typeAppareil: 'CAMERA',
      status: isOn ? 'HORSLIGNE' : 'ENLIGNE'
    });
  };

  return (
    <>
      <div className={`relative w-full max-w-md mx-auto h-full rounded-[45px] overflow-hidden shadow-2xl group bg-gray-900 flex flex-col justify-between pb-4 transition-all duration-300 select-none ${className}`}>
        
        <img 
          src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"} 
          alt={nomAppareil || "Caméra"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isOn ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale brightness-50'
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

        <div className="relative pt-4 px-5 flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={prevCamera} 
              className={`p-1 bg-black/40 text-white rounded-full ${items.length <= 1 && 'opacity-0'}`}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-[10px] text-white/90 font-black bg-black/30 px-2.5 py-0.5 rounded-full uppercase">
              {items.length} CAM
            </span>

            <button 
              onClick={nextCamera} 
              className={`p-1 bg-black/40 text-white rounded-full ${items.length <= 1 && 'opacity-0'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setIsFullscreen(true)}
              className="text-white bg-black/30 p-1.5 rounded-full"
            >
              <Maximize2 size={14} />
            </button>
            <DeviceMenu
              dark
              deviceName={nomAppareil}
              onEdit={() => onEditDevice?.(currentCamera)}
              onDelete={() => onDeleteDevice?.(_id || id)}
            />
          </div>
        </div>

        <div className="relative text-center px-5 mt-1 z-10 flex flex-col items-center">
          <h3 className="text-white text-xl font-bold">
            {nomAppareil || "Caméra"}
          </h3>
          <p className="text-white/60 text-[9px] font-bold uppercase mt-0.5">
            {resolution || 'Ultra HD 4K'}
          </p>

          {!isOn && (
            <span className="mt-1 bg-black/60 text-gray-400 text-[8px] px-2 py-0.5 rounded-full">
              Hors-ligne
            </span>
          )}
        </div>

        <div className="relative flex-1 flex items-end px-5 mb-2 z-10 justify-between">
          {isOn ? (
            <div className="bg-white/90 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Radio className="text-red-500 animate-pulse" size={12} />
              <span className="text-[8px] font-black text-red-600">Live</span>
            </div>
          ) : <div />}

          {isOn && estEnregistrement && (
            <div className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[8px] font-bold">
              REC
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-1.5 px-5 z-10 w-full">
          {isOn && (
            <button 
              onClick={() => toggleProperty('estEnregistrement', estEnregistrement)}
              className="w-full py-2 rounded-[15px] text-[11px] font-bold bg-white/20 text-white"
            >
              {estEnregistrement ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
            </button>
          )}

          <button 
            onClick={togglePower}
            className={`w-full py-2.5 rounded-[18px] ${
              isOn ? 'bg-white text-black' : 'bg-indigo-600 text-white'
            }`}
          >
            {isOn ? <VideoOff size={16} /> : <Video size={16} />}
            <span className="text-xs font-bold ml-2">
              {isOn ? 'Éteindre la caméra' : 'Visualiser en direct'}
            </span>
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full max-w-6xl aspect-video bg-gray-950">
            <img 
              src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=90"} 
              className={`w-full h-full object-cover ${isOn ? '' : 'opacity-10'}`}
            />

            <button 
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 left-6 text-white bg-black/50 px-4 py-2 rounded-full"
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CameraCard;