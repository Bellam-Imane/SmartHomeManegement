import React from 'react';
import { Eye, Radio, Video, VideoOff } from 'lucide-react';

/**
 * COMPOSANT CAMERACARD
 * Je contrôle ici le flux vidéo de sécurité en liaison directe avec mon parent RoomDetails.
 */
const CameraCard = ({ appareil, cameraData, imageSrc, onUpdateAppareil }) => {
  
  // Étape 1 : Récupération des données sécurisée via "appareil" (Parent) ou "cameraData"
  const currentCamera = appareil || cameraData;

  // Étape 2 : Sécurité d'affichage si la caméra n'est pas encore prête
  if (!currentCamera) {
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

  // Extraction propre de mes propriétés
  const { _id, id, nomAppareil, status, estEnregistrement, resolution } = currentCamera;
  const isOn = status === 'ENLIGNE';

  // Notification pour modifier un attribut spécifique (ex: estEnregistrement)
  const toggleProperty = (property, currentValue) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        ...currentCamera,
        [property]: !currentValue
      });
    }
  };

  // Switch d'alimentation centralisé ('ENLIGNE' / 'HORSLIGNE')
  const togglePower = () => {
    if (onUpdateAppareil) {
      onUpdateAppareil(_id || id, {
        ...currentCamera,
        status: isOn ? 'HORSLIGNE' : 'ENLIGNE'
      });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-[45px] overflow-hidden shadow-2xl group bg-gray-900 transition-all duration-300">
      
      {/* 1. VISUEL : Flux vidéo simulé ou écran noirci si éteinte */}
      <img 
        src={imageSrc || "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"} 
        alt={nomAppareil || "Caméra"}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
          isOn ? 'opacity-100 grayscale-0' : 'opacity-20 grayscale brightness-50'
        }`}
      />

      {/* 2. OVERLAY : Dégradé sombre pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* 3. BADGE LIVE : Visible uniquement en mode ENLIGNE */}
      {isOn && (
        <div className="absolute top-6 left-6">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg flex flex-col items-center min-w-[55px]">
            <Radio className="text-red-500 animate-pulse" size={20} />
            <span className="text-[10px] font-black text-red-600 mt-1 uppercase tracking-tighter">Live</span>
          </div>
        </div>
      )}

      {/* 4. INDICATEUR REC : Actif si allumée ET en train d'enregistrer */}
      {isOn && estEnregistrement && (
        <div className="absolute top-6 right-6">
          <div className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            REC
          </div>
        </div>
      )}

      {/* 5. INFORMATIONS TEXTUELLES */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h3 className="text-white drop-shadow-lg text-2xl font-bold tracking-tight">
          {nomAppareil || "Caméra de Surveillance"}
        </h3>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-[3px] mt-1">
          {resolution || 'Ultra HD 4K'}
        </p>
        {!isOn && (
          <span className="inline-block mt-2 bg-black/50 text-gray-400 text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-wider">
            Hors-ligne
          </span>
        )}
      </div>

      {/* 6. PANEL DES BOUTONS D'ACTION */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-col gap-2 px-6">
        
        {/* Le bouton REC ne s'affiche que si la caméra est active */}
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
        
        {/* Bouton principal ON/OFF (Ici où j'avais fait l'erreur de balise, maintenant c'est corrigé !) */}
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
  );
};

export default CameraCard;