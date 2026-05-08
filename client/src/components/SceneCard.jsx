import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react'; 

const SceneCard = ({ title, icon: Icon, desc, isActiveByDefault = false }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isActive, setIsActive] = useState(isActiveByDefault); 

  return (
    
    <div className={`min-w-[300px] p-7 rounded-[40px] transition-all duration-500 shadow-sm border ${isActive ? 'bg-white border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
      
      
      <div className="flex justify-between items-start mb-5">
       
        <div className={`p-3.5 rounded-2xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400'}`}>
          <Icon size={24} />
        </div>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={() => setIsActive(!isActive)} 
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e293b]"></div>
        </label>
      </div>
      
      {/* titre du scene*/}
     
      <div className="flex justify-center mt-2 mb-4">
        <h3 className={`font-bold text-xl transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h3>
      </div>
      
      {/*description du scene */}
      
      <div className="flex justify-end mt-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {/* Animation pour fleche (rotate) */}
          <ChevronDown size={18} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 5. effet Dropdown (Wobble animation) */}
      <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'max-h-40 mt-3' : 'max-h-0'}`}>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed px-1 animate-in fade-in slide-in-from-top-1 duration-500">
          {desc}
        </p>
      </div>
    </div>
  );
};

export default SceneCard;