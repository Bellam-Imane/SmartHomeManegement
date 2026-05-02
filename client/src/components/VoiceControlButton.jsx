import React from 'react';
import { Mic } from 'lucide-react';

const VoiceControlButton = ({ onClick, isActive = false }) => {
    return(
        <button
            onClick={onClick}
            className={`group relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-lg active:scale-95
              ${isActive   
                 ? 'bg-red-500 shadow-red-200' 
                 : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
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

export default VoiceControlButton ;