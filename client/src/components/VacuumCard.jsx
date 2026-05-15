import React, { useState } from 'react';
import { MoreVertical, BatteryCharging, Battery } from 'lucide-react';
import vacuumImage from '../assets/images/aspirateur.png'; 

/**
 * COMPOSANT VACUUMCARD : Contrôle de l'aspirateur robot (Prop: appareil)
 */
const VacuumCard = ({ appareil }) => {

  // 1. SÉCURITÉ : Vérification si l'appareil existe
  if (!appareil) {
    return (
      <div className="w-full max-w-[340px] aspect-square rounded-[45px] bg-gray-200 flex items-center justify-center font-bold italic text-gray-400">
        Chargement de l'aspirateur...
      </div>
    );
  }

  // 2. ÉTATS LOCAUX (status, chargeBatterie et estEnCharge du schéma Mongoose)
  const [isOn, setIsOn] = useState(appareil.status === 'ENLIGNE');
  const [batterie, setBatterie] = useState(appareil.chargeBatterie || 100);
  const [isCharging, setIsCharging] = useState(appareil.estEnCharge || false);

  return (
    <div className="relative w-full max-w-[340px] bg-[#e5e5e5]/60 backdrop-blur-md rounded-[45px] p-6 shadow-xl flex flex-col justify-between min-h-[360px] transition-all duration-500 select-none">
      
      {/* ================= SECTION HEADER ================= */}
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-bold text-gray-800 tracking-wide">
          {appareil.nomAppareil || 'Aspirateur'}
        </h3>
        
        <div className="flex items-center gap-2">
          {/* Switch On/Off (status) */}
          <button 
            onClick={() => setIsOn(!isOn)}
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
      <div className="flex items-center justify-center my-6 relative h-36">
        <img 
          src={vacuumImage} 
          alt="Aspirateur Robot" 
          className={`w-full max-w-[190px] h-auto object-contain transition-all duration-500 ${isOn ? 'opacity-100 drop-shadow-xl' : 'opacity-50 brightness-95'}`} 
        />
      </div>

      {/* ================= SECTION FOOTER : BATTERIE STATUS ================= */}
      <div className="bg-white/80 border border-white/60 rounded-[30px] p-4 flex items-center gap-4 shadow-sm">
        {/* أيقونة البطارية التفاعلية */}
        <div className="w-12 h-12 rounded-2xl bg-[#faf6f0] flex items-center justify-center text-gray-800 shrink-0 shadow-xs">
          {isCharging || isOn ? (
            <BatteryCharging size={24} className="text-amber-500" />
          ) : (
            <Battery size={24} className="text-gray-700" />
          )}
        </div>

        {/* نسبة الشحن من الـ Schema */}
        <div className="flex flex-col text-left">
          <span className="text-2xl font-black text-gray-800 leading-none">
            {batterie} %
          </span>
          <span className="text-xs text-gray-400 font-medium mt-1 tracking-tight">
            {isCharging ? 'en cours de charge' : 'chargeur de batterie'}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default VacuumCard;