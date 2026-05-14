import React from 'react';
import { Eye, Radio } from 'lucide-react';

/**
 * Composant CameraCard : Affiche le flux en direct d'une caméra de sécurité.
 */
const CameraCard = ({ cameraData, imageSrc }) => {
  
  // 1. SÉCURITÉ : Si cameraData n'est pas encore chargé, on affiche un état de chargement
  // Cela évite l'erreur "Cannot destructure property of undefined"
  if (!cameraData) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] bg-[#B5B8C4] flex items-center justify-center shadow-xl">
        <div className="text-center">
          <p className="text-gray-700 font-bold italic animate-pulse">
            Chargement du flux vidéo...
          </p>
        </div>
      </div>
    );
  }

  // 2. EXTRACTION : On ne fait l'extraction qu'APRÈS avoir vérifié que cameraData existe
  const { nomAppareil, status, estEnregistrement, resolution } = cameraData;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] overflow-hidden shadow-2xl group bg-gray-200">
      
      {/* 1. IMAGE DE FOND (Flux vidéo simulé) */}
      <img 
        src={imageSrc} 
        alt={nomAppareil || "Caméra"}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* 2. OVERLAY : Dégradé pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* 3. BADGE LIVE : Uniquement si status est ENLIGNE */}
      {status === 'ENLIGNE' && (
        <div className="absolute top-6 left-6">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg flex flex-col items-center min-w-[55px]">
            <Radio className="text-red-500 animate-pulse" size={20} />
            <span className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-tighter">Live</span>
          </div>
        </div>
      )}

      {/* 4. INDICATEUR REC : Uniquement si estEnregistrement est true */}
      {estEnregistrement && (
        <div className="absolute top-6 right-6">
          <div className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            REC
          </div>
        </div>
      )}

      {/* 5. INFOS TEXTUELLES */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h3 className="text-white drop-shadow-lg text-2xl font-bold tracking-tight">
          {nomAppareil}
        </h3>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-[3px] mt-1">
          {resolution || 'Ultra HD 4K'}
        </p>
      </div>

      {/* 6. BOUTON D'ACTION */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center px-6">
        <button className="w-full flex items-center justify-center gap-3 bg-white/95 backdrop-blur-xl py-4 rounded-[25px] shadow-2xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-95">
          <Eye className="text-indigo-600" size={22} />
          <span className="text-gray-900 font-bold text-sm italic">Visualiser en direct</span>
        </button>
      </div>

    </div>
  );
};

export default CameraCard;