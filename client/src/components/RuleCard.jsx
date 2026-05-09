import React, { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

const RuleCard = ({ title, icon: Icon, time, action }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={`w-full p-5 rounded-[30px] transition-all duration-300 border ${isActive ? 'bg-white border-blue-100 shadow-md' : 'bg-gray-50/50 border-gray-100'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* icon*/}
          <div className={`p-3 rounded-2xl ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm'}`}>
            <Icon size={22} />
          </div>
          
          {/*titre*/}
          <div>
            <h3 className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{title}</h3>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock size={12} />
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer scale-90">
            <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="sr-only peer" />
            <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#1e293b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
          
          {/*fleche de description*/}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 text-gray-400 hover:text-gray-600 transition-transform">
            <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* description (temps + action)*/}
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-24 mt-4' : 'max-h-0'}`}>
        <div className="p-3 bg-white/50 rounded-2xl border border-gray-50">
          <p className="text-[12px] text-gray-600 leading-relaxed">
            <span className="font-bold text-blue-600">Planification:</span> {time} <br />
            <span className="font-bold text-blue-600">Action:</span> {action}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RuleCard;