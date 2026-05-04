import React from 'react';
import { Power } from 'lucide-react';

const DeviceCard = ({ name, room, icon: Icon, isOn, onToggle, colorClass }) => {
  return (
    <div className={`relative p-5 rounded-[30px] transition-all duration-500 border ${
      isOn 
      ? 'bg-white/80 shadow-xl border-white/50 scale-[1.02]' 
      : 'bg-white/20 backdrop-blur-md border-white/20 shadow-sm opacity-80'
    }`}>
      <div className="flex justify-between items-start mb-8">
        {/* Icon Container */}
        <div className={`p-3 rounded-2xl transition-colors duration-500 ${
          isOn ? colorClass : 'bg-gray-200/50 text-gray-500'
        }`}>
          <Icon size={24} />
        </div>

        {/* Toggle Switch (Simplified) */}
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

      <div>
        <h3 className={`font-bold text-lg ${isOn ? 'text-gray-900' : 'text-gray-600'}`}>
          {name}
        </h3>
        <p className="text-gray-400 text-sm font-medium">{room}</p>
      </div>
      
      {/* Status Light */}
      <div className={`absolute bottom-5 right-5 w-2 h-2 rounded-full ${
        isOn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
      }`} />
    </div>
  );
};

export default DeviceCard;