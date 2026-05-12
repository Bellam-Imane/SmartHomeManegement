import React from 'react';
import { Eye, Radio } from 'lucide-react';

/**
 * Composant CameraCard : Affiche le flux en direct d'une caméra de sécurité.
 * @param {Object} cameraData - Les données issues du modèle Mongoose (nom, statut, enregistrement, etc.)
 * @param {string} imageSrc - L'URL ou le chemin de l'image de fond (flux vidéo simulé)
 */
const CameraCard = ({ cameraData, imageSrc }) => {
  // Extraction des données du modèle pour une utilisation facile
  const { nomAppareil, status, estEnregistrement, resolution } = cameraData;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] overflow-hidden shadow-2xl group bg-gray-200">
      
      {/* 1. IMAGE DE FOND : Simule le flux vidéo de la caméra */}
      <img 
        src={imageSrc} 
        alt={nomAppareil}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* 2. OVERLAY : Dégradé sombre pour améliorer la lisibilité du texte blanc */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* 3. BADGE LIVE : S'affiche uniquement si l'appareil est en ligne (ENLIGNE) */}
      {status === 'ENLIGNE' && (
        <div className="absolute top-6 left-6">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg flex flex-col items-center min-w-[55px]">
            {/* Icône animée pour simuler une diffusion en direct */}
            <Radio className="text-red-500 animate-pulse" size={20} />
            <span className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-tighter">Live</span>
          </div>
        </div>
      )}

      {/* 4. INDICATEUR REC : S'affiche si la caméra est en train d'enregistrer */}
      {estEnregistrement && (
        <div className="absolute top-6 right-6">
          <div className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
            {/* Petit point blanc qui clignote */}
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            REC
          </div>
        </div>
      )}

      {/* 5. INFOS TEXTUELLES : Nom de la pièce et résolution de la caméra */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h3 className="text-white drop-shadow-lg text-2xl font-bold tracking-tight">
          {nomAppareil}
        </h3>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-[3px] mt-1">
          {resolution || 'Ultra HD 4K'}
        </p>
      </div>

      {/* 6. BOUTON D'ACTION : Permet d'ouvrir le flux en plein écran */}
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