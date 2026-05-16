import React from 'react';
import { MoreVertical, BatteryCharging, Battery, ShieldAlert, Sliders } from 'lucide-react';
import vacuumImage from '../assets/images/aspirateur.png'; 

/**
 * COMPOSANT VACUUMCARD : Contrôle de l'aspirateur robot connecté au schéma Mongoose
 */
const VacuumCard = ({ appareil, onUpdateAppareil }) => {

  // 1. SÉCURITÉ : Vérification si l'appareil existe
  if (!appareil) {
    return (
      <div className="w-full max-w-[340px] aspect-square rounded-[45px] bg-gray-200 flex items-center justify-center font-bold italic text-gray-400">
        Chargement de l'aspirateur...
      </div>
    );
  }

  // 2. EXTRACTION EN DIRECT DES DONNÉES (Plus de blocage de States locaux)
  const isOn = appareil.status === 'ENLIGNE';
  const batterie = appareil.chargeBatterie !== undefined ? appareil.chargeBatterie : 100;
  const isCharging = appareil.estEnCharge || false;
  const currentMode = appareil.modeNettoyage || 'STANDARD'; // ['STANDARD', 'SILENCIEUX', 'TURBO']

  
  const updateVacuumProperty = (updates) => {
    if (onUpdateAppareil) {
      onUpdateAppareil(appareil._id || appareil.id, {
        ...appareil,
        ...updates
      });
    }
  };

  const togglePower = () => {
    const nextStatus = isOn ? 'HORSLIGNE' : 'ENLIGNE';
    updateVacuumProperty({ status: nextStatus });
  };

  const handleModeChange = (modeName) => {
    if (!isOn) return; 
    updateVacuumProperty({ modeNettoyage: modeName });
  };

  return (
    <div className="relative w-full max-w-[340px] bg-[#e5e5e5]/60 backdrop-blur-md rounded-[45px] p-6 shadow-xl flex flex-col justify-between min-h-[440px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center px-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 tracking-wide leading-tight">
            {appareil.nomAppareil || 'Aspirateur'}
          </h3>
          {appareil.marque && (
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{appareil.marque}</span>
          )}
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

      {/* ================= SECTION CENTRALE : IMAGE DU ROBOT ================= */}
      <div className="flex items-center justify-center my-4 relative h-32">
        <img 
          src={vacuumImage} 
          alt="Aspirateur Robot" 
          className={`w-full max-w-[170px] h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 drop-shadow-2xl scale-105' : 'opacity-40 brightness-95'}`} 
        />
        
        {isOn && (
          <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl animate-pulse pointer-events-none" />
        )}
      </div>

      {/* ================= SECTION SECTEUR : CONTROLE DES MODES (Mongoose Enum) ================= */}
      <div className={`w-full bg-white/40 rounded-2xl p-1.5 flex gap-1 mb-3 border border-white/40 transition-opacity duration-300 ${!isOn && 'opacity-30 pointer-events-none'}`}>
        {['SILENCIEUX', 'STANDARD', 'TURBO'].map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-all capitalize ${
              currentMode === mode 
                ? 'bg-gray-800 text-white shadow-md' 
                : 'text-gray-600 hover:bg-white/50'
            }`}
          >
            {mode.toLowerCase()}
          </button>
        ))}
      </div>

      {/* ================= SECTION FOOTER : BATTERIE STATUS ================= */}
      <div className="bg-white/80 border border-white/60 rounded-[30px] p-4 flex items-center gap-4 shadow-sm">
        
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