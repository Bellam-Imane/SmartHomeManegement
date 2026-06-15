import React from 'react';
import { Zap } from 'lucide-react';

const DeviceCard = ({ name, room, icon: Icon, isOn, onToggle, colorClass, consommationActuelle, typeAppareil }) => {
  // Formater le nom du type pour l'affichage
  const typeLabel = typeAppareil
    ? typeAppareil.charAt(0) + typeAppareil.slice(1).toLowerCase()
    : null;

  return (
    <div className={`relative p-5 rounded-[30px] transition-all duration-500 border ${
      isOn 
      ? 'bg-white/80 shadow-xl border-white/50 scale-[1.02]' 
      : 'bg-white/20 backdrop-blur-md border-white/20 shadow-sm opacity-80'
    }`}>
      <div className="flex justify-between items-start mb-4">
        {/* Icon Container */}
        <div className={`p-3 rounded-2xl transition-colors duration-500 ${
          isOn ? colorClass : 'bg-gray-200/50 text-gray-500'
        }`}>
          <Icon size={24} />
        </div>

        {/* Toggle Switch */}
        <button 
          onClick={onToggle}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
            isOn ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
            isOn ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      <div className="mb-2">
        <h3 className={`font-bold text-lg ${isOn ? 'text-gray-900' : 'text-gray-600'}`}>
          {name}
        </h3>
        <p className="text-gray-400 text-sm font-medium">{room}</p>
      </div>

      {/* Watts + Type Badge */}
      <div className="flex items-center justify-between mt-2">
        {consommationActuelle !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            isOn && consommationActuelle > 0 ? 'text-orange-600' : 'text-gray-400'
          }`}>
            <Zap size={12} />
            <span>{isOn ? consommationActuelle : 0} W</span>
          </div>
        )}
        {typeLabel && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isOn ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
          }`}>
            {typeLabel}
          </span>
        )}
      </div>
      
      {/* Status Light */}
      <div className={`absolute bottom-5 right-5 w-2 h-2 rounded-full ${
        isOn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
      }`} />
    </div>
  );
};

export default DeviceCard;
