import React, { useState, useEffect } from 'react';
import { 
  Blinds, MoreVertical, ChevronLeft, ChevronRight, Moon, Sun, 
  ShieldCheck, Clapperboard, Settings2
} from 'lucide-react';

/**
 * COMPOSANT CURTAINSCARD (Version Large & Horizontale)
 * Gère l'affichage dynamique et le contrôle des rideaux connectés.
 */
const CurtainsCard = ({ curtainsData, onUpdateAppareil, className = '' }) => {

  // Sécurisation des données reçues sous forme de tableau
  const items = Array.isArray(curtainsData) ? curtainsData : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMode, setActiveMode] = useState('Ombrage automatique');

  // Réinitialisation de l'index si les rideaux changent ou diminuent
  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  const currentCurtain = items[currentIndex];

  // EFFET : Synchronisation du mode actif avec l'état réel stocké en Base de Données
  useEffect(() => {
    if (currentCurtain && currentCurtain.mode) {
      setActiveMode(currentCurtain.mode);
    }
  }, [currentCurtain]);

  // Rendu d'attente si aucun appareil n'est disponible
  if (items.length === 0) {
    return (
      <div className="w-full h-[230px] rounded-[45px] bg-[#ebf5ff] flex items-center justify-center font-bold italic text-gray-500">
        Chargement des rideaux...
      </div>
    );
  }

  const isOn = currentCurtain.status === 'ENLIGNE';
  const pourcentage = currentCurtain.pourcentageOuverture || 0; 

  // Navigation vers le rideau suivant
  const nextCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Navigation vers le rideau précédent
  const prevCurtain = () => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  // Mise à jour générique d'une propriété de l'appareil vers le Backend
  const updateCurtainProperty = (property, value) => {
    if (onUpdateAppareil && currentCurtain) {
      onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
        ...currentCurtain,
        [property]: value  
      });
    }
  };

  // Activation / Désactivation de l'alimentation (Status)
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateCurtainProperty('status', nextStatus);
  };

  // FONCTION : Gère le changement manuel du slider (Désactive le mode automatique)
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setActiveMode('Manuel'); // Basculement immédiat sur l'état visuel Manuel
    
    // Envoi simultané de la nouvelle valeur et du mode 'Manuel' au Backend
    if (onUpdateAppareil && currentCurtain) {
      onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
        ...currentCurtain,
        pourcentageOuverture: value,
        mode: 'Manuel'
      });
    }
  };

  // FONCTION : Gère le changement de mode prédéfini via les boutons
  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    if (!isOn) return; 
    
    let nextPourcentage = pourcentage;
    switch(modeId) {
      case 'Veille': nextPourcentage = 0; break;
      case 'Réveil': nextPourcentage = 100; break;
      case 'Cinema': nextPourcentage = 20; break;
      case 'Ombrage automatique': nextPourcentage = 60; break;
      default: break;
    }

    // Persistance du mode sélectionné et du pourcentage associé dans la base de données
    if (onUpdateAppareil && currentCurtain) {
      onUpdateAppareil(currentCurtain._id || currentCurtain.id, {
        ...currentCurtain,
        pourcentageOuverture: nextPourcentage,
        mode: modeId
      });
    }
  };

  // Liste des modes disponibles avec leurs icônes et descriptions respectives
  const modesList = [
    { id: 'Veille', label: 'Veille', icon: <Moon size={13} />, desc: "Mode Veille : Les rideaux sont complètement fermés (0%) pour préserver votre sommeil." },
    { id: 'Réveil', label: 'Réveil', icon: <Sun size={13} />, desc: "Mode Réveil : Les rideaux sont entièrement ouverts (100%) pour laisser entrer la lumière du jour." },
    { id: 'Ombrage automatique', label: 'Ombrage', icon: <ShieldCheck size={13} />, desc: "Mode Ombrage : Ouverture optimale (60%) pour réguler naturellement la température de la pièce." },
    { id: 'Cinema', label: 'Cinema', icon: <Clapperboard size={13} />, desc: "Mode Cinéma : Rideaux presque fermés (20%) pour une immersion totale sans reflets sur vos écrans." },
    { id: 'Manuel', label: 'Manuel', icon: <Settings2 size={13} />, desc: "Mode Manuel : Ajustement personnalisé de l'ouverture selon vos préférences actuelles." }
  ];

  const currentModeObj = modesList.find(m => m.id === activeMode) || modesList[2];
  const modeDescription = isOn 
    ? currentModeObj.desc 
    : "Appareil hors ligne. Allumez les rideaux pour activer le mode et configurer l'ouverture.";

  return (
    <div className={`relative w-full h-[230px] bg-[#ebf5ff] rounded-[45px] p-5 shadow-xl flex flex-col justify-between transition-all duration-500 select-none ${className}`}>
      
      {/* HEADER : Affichage du nom dynamique de l'appareil et contrôles d'alimentation */}
      <div className="flex justify-between items-center w-full px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Blinds size={20} className="text-gray-700" />
            {/* Injection dynamique du nom de l'appareil depuis MongoDB */}
            <h3 className="text-[17px] font-bold text-gray-800 tracking-tight">
              {currentCurtain.nomAppareil || 'Rideau'}
            </h3>
          </div>
          {/* CORRECTION : Affichage uniquement du nombre total d'appareils connectés */}
          <span className="text-[11px] text-gray-500 font-medium ml-7">
            {items.length} appareils connectés
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch pour le statut ON/OFF */}
          <button 
            onClick={togglePower}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-1' : 'left-1'}`} />
          </button>
          <button className="text-gray-700 hover:bg-black/5 p-1 rounded-full transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* CONTENU CENTRAL : Barre de progression (Slider) & sélecteur de modes horizontal */}
      <div className="flex items-center justify-between w-full flex-1 mt-1">
        {/* Navigation Gauche */}
        <button 
          onClick={prevCurtain} 
          className={`p-1 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>

        <div className="flex-1 flex flex-col justify-center px-4 h-full gap-4 relative">
          
          {/* Container principal du Slider Interactif */}
          <div className={`w-full relative flex items-center h-2 bg-gray-300/60 rounded-full transition-opacity mt-4 ${!isOn && 'opacity-30 pointer-events-none'}`}>
            
            {/* Remplissage de la progression de fermeture/ouverture */}
            <div className="absolute left-0 h-full bg-gray-800 rounded-full" style={{ width: `${pourcentage}%` }} />
            
            {/* Input range masqué capturant les événements natifs de drag & drop */}
            <input 
              type="range" min="0" max="100" value={pourcentage} onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            {/* Curseur physique personnalisé (Thumb) */}
            <div className="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-md transform -translate-x-1/2 pointer-events-none z-10" style={{ left: `${pourcentage}%` }} />
            
            {/* Bulle numérique indiquant le pourcentage exact au-dessus du curseur */}
            <div 
              className="absolute -top-6 text-xs font-extrabold text-gray-800 transform -translate-x-1/2 pointer-events-none whitespace-nowrap transition-all duration-75"
              style={{ left: `${pourcentage}%` }}
            >
              {pourcentage}%
            </div>
            
          </div>

          {/* Grille horizontale des modes avec défilement sécurisé */}
          <div className={`flex gap-2 mt-2 justify-start transition-opacity overflow-x-auto scrollbar-none ${!isOn && 'opacity-30 pointer-events-none'}`}>
            {modesList.map((item) => (
              <button
                key={item.id} onClick={() => handleModeChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all shrink-0 ${activeMode === item.id ? 'bg-white border-white shadow-sm' : 'bg-transparent border-transparent hover:bg-black/5'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeMode === item.id ? 'bg-[#ebf5ff] text-blue-600' : 'bg-white text-gray-500 shadow-sm'}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Droite */}
        <button 
          onClick={nextCurtain} 
          className={`p-1 hover:bg-black/5 rounded-full transition-colors z-10 shrink-0 ${items.length <= 1 && 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* ZONE INFERIEURE : Rendu textuel de la description du mode actif ou de l'état offline */}
      <div className="text-left px-2 pt-1 border-t border-black/5 text-[10px] text-gray-500 italic font-medium min-h-[20px] transition-all duration-300">
        {modeDescription}
      </div>
      
    </div>
  );
};

export default CurtainsCard;