import React from 'react';
import { Mic } from 'lucide-react';

const VoiceControlButton = ({ onClick, isActive = false }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg active:scale-95
              ${isActive   
                  ? 'bg-[#0f172a] shadow-slate-400' 
                  : 'bg-[#1e293b] hover:bg-[#0f172a] shadow-slate-200'
                }`}
            title="Contrôle Vocal"
        >
            <span className={`absolute inset-0 rounded-full bg-current opacity-20 animate-ping 
                 ${isActive ? 'block' : 'hidden group-hover:block'}`}>
            </span>

            <Mic size={24} className="text-white" />
        </button>
    );
}

export default VoiceControlButton;