import React, { useState, useEffect } from 'react';
import { MoreVertical, BatteryCharging, Battery, ChevronLeft, ChevronRight } from 'lucide-react';
import vacuumImage from '../assets/images/aspirateur.png'; 

/**
 * COMPOSANT VACUUMCARD : Contrôle des aspirateurs robots avec système de navigation
 */
const VacuumCard = ({ vacuumData, onUpdateAppareil, className = '' }) => {

  // 1. SÉCURITÉ : Vérification si la liste des aspirateurs est vide
  if (!vacuumData || vacuumData.length === 0) {
    return (
      <div className="w-full h-full rounded-[45px] bg-gray-200 flex items-center justify-center font-bold italic text-gray-400">
        Chargement de l'aspirateur...
      </div>
    );
  }

  // 2. GESTION DE LA NAVIGATION
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sécurisation de l'index pour éviter de lire un élément undefined lors des changements de données
  const safeIndex = currentIndex < vacuumData.length ? currentIndex : 0;
  const currentVacuum = vacuumData[safeIndex];

  // Réinitialiser l'index si la liste change ou devient plus petite (avec sécurité)
  useEffect(() => {
    if (currentIndex >= vacuumData.length) {
      setCurrentIndex(0);
    }
  }, [vacuumData.length, currentIndex]);

  // 3. EXTRACTION EN DIRECT DES DONNÉES de l'aspirateur actuel
  const isOn = currentVacuum?.status === 'ENLIGNE';
  const batterie = currentVacuum?.chargeBatterie !== undefined ? currentVacuum.chargeBatterie : 100;
  const isCharging = currentVacuum?.estEnCharge || false;
  
  // CORRECTION LOGIQUE DES MODES : Assurer la correspondance exacte avec les ENUMS Mongoose (Majuscules)
  const currentMode = currentVacuum?.modeNettoyage || 'STANDARD'; 

  // 📝 DICTIONNAIRE DES DESCRIPTIONS DE MODE (Ajouté pour expliquer le mode actuel)
  const modeDescriptions = {
    SILENCIEUX: "Aspiration discrète pour un nettoyage silencieux, idéal pour la nuit.",
    STANDARD: "Puissance équilibrée idéale pour un nettoyage quotidien efficace.",
    TURBO: "Puissance maximale pour les tapis et les saletés incrustées (consomme plus)."
  };

  // Fonctions de navigation pour changer d'aspirateur
  const nextVacuum = () => {
    setCurrentIndex((prev) => (prev === vacuumData.length - 1 ? 0 : prev + 1));
  };

  // Autre fonction de navigation
  const prevVacuum = () => {
    setCurrentIndex((prev) => (prev === 0 ? vacuumData.length - 1 : prev - 1));
  };

  // CORRECTION CRUCIALE : Envoi exclusif des champs modifiés pour éviter les conflits de Discriminator Key
  const updateVacuumProperty = (updates) => {
    if (onUpdateAppareil && currentVacuum) {
      onUpdateAppareil(currentVacuum._id || currentVacuum.id, updates);
    }
  };

  // Logique pour Allumer / Éteindre l'appareil
  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateVacuumProperty({ status: nextStatus });
  };

  // Logique stricte pour le changement de mode de nettoyage (Uniquement si En Ligne)
  const handleModeChange = (modeName) => {
    if (!isOn) return; 
    // On envoie le mode exact attendu par le schéma Mongoose (Ex: 'TURBO', 'STANDARD')
    updateVacuumProperty({ modeNettoyage: modeName.toUpperCase() });
  };

  return (
    <div className={`relative w-full bg-[#e5e5e5]/60 backdrop-blur-md rounded-[45px] p-6 shadow-xl flex flex-col justify-between h-full transition-all duration-500 select-none ${className}`}>
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center px-2 z-10">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 tracking-wide leading-tight">
            {currentVacuum?.nomAppareil || 'Aspirateur'}
          </h3>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            {vacuumData.length} appareils {currentVacuum?.marque ? `• ${currentVacuum.marque}` : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Switch On/Off lié au status Mongoose */}
          <button 
            onClick={togglePower}
            className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${isOn ? 'bg-gray-800' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isOn ? 'right-1' : 'left-1'}`} />
          </button>
          <button className="text-gray-600 hover:bg-black/5 p-1 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* ================= SECTION CENTRALE : NAVIGATION ET IMAGE ================= */}
      <div className="flex items-center justify-between my-4 relative h-32">
        {/* Bouton Précédent */}
        <button onClick={prevVacuum} className="p-1.5 hover:bg-black/5 rounded-full transition-colors z-20">
          <ChevronLeft size={26} className="text-gray-700" />
        </button>

        <div className="relative flex justify-center items-center w-full">
          <img 
            src={vacuumImage} 
            alt="Aspirateur Robot" 
            className={`w-full max-w-[150px] h-auto object-contain transition-all duration-500 z-10 ${isOn ? 'opacity-100 drop-shadow-2xl scale-105' : 'opacity-40 brightness-95'}`} 
          />
          
          {isOn && (
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl animate-pulse pointer-events-none" />
          )}
        </div>

        {/* Bouton Suivant */}
        <button onClick={nextVacuum} className="p-1.5 hover:bg-black/5 rounded-full transition-colors z-20">
          <ChevronRight size={26} className="text-gray-700" />
        </button>
      </div>

      {/* ================= SECTION SECTEUR : CONTROLE DES MODES ================= */}
      <div className="flex flex-col mb-3">
        <div className={`w-full bg-white/40 rounded-2xl p-1.5 flex gap-1 border border-white/40 transition-opacity duration-300 z-10 ${!isOn && 'opacity-30 pointer-events-none'}`}>
          {['SILENCIEUX', 'STANDARD', 'TURBO'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-all capitalize ${
                currentMode.toUpperCase() === mode.toUpperCase() 
                  ? 'bg-gray-800 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              {mode.toLowerCase()}
            </button>
          ))}
        </div>

        {/* 📝 DESCRIPTION DYNAMIQUE DU MODE SÉLECTIONNÉ (S'affiche uniquement si l'appareil est allumé) */}
        {isOn && (
          <p className="text-[10px] text-gray-500 italic mt-2 px-2 text-center transition-all duration-300">
            {modeDescriptions[currentMode.toUpperCase()] || modeDescriptions.STANDARD}
          </p>
        )}
      </div>

      {/* ================= SECTION FOOTER : BATTERIE STATUS ================= */}
      <div className="bg-white/80 border border-white/60 rounded-[30px] p-4 flex items-center gap-4 shadow-sm z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#faf6f0] flex items-center justify-center text-gray-800 shrink-0 shadow-xs">
          {isCharging ? (
            <BatteryCharging size={24} className="text-emerald-500 animate-bounce" />
          ) : isOn ? (
            <BatteryCharging size={24} className="text-amber-500" />
          ) : (
            <Battery size={24} className={batterie < 20 ? "text-red-500" : "text-gray-700"} />
          )}
        </div>

        <div className="flex flex-col text-left">
          <span className="text-2xl font-black text-gray-800 leading-none">
            {batterie}%
          </span>
          <span className="text-[11px] text-gray-400 font-semibold mt-1 tracking-tight">
            {isCharging ? 'En cours de charge...' : isOn ? 'Nettoyage en cours' : 'Sur sa station de charge'}
          </span>
        </div>
      </div> 
      
    </div>
  );
};

export default VacuumCard;