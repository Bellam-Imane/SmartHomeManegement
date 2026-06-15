import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, Clock, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const RuleCard = ({ title, icon: Icon, time, action, ruleId, isActive: initialActive, onDelete, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(initialActive ?? true);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const togglingRef = useRef(false);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleToggle = async () => {
    if (togglingRef.current) return;
    togglingRef.current = true;
    setIsToggling(true);

    const previousState = isActive;
    setIsActive(!isActive); // Optimistic update

    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${API_BASE}/api/rules/${ruleId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newState = res.data.isPlanif ? res.data.estActive : res.data.etat;
      setIsActive(newState);
      if (onToggle) onToggle(ruleId, newState);
    } catch (err) {
      console.error("[RuleCard] Toggle failed:", err.message);
      setIsActive(previousState); // Rollback on failure
      showToast("Échec du changement d'état.");
    } finally {
      setIsToggling(false);
      togglingRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette règle ?")) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/rules/${ruleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDelete) onDelete(ruleId);
    } catch (err) {
      console.error("[RuleCard] Delete failed:", err.message);
      setIsDeleting(false);
      showToast("Échec de la suppression.");
    }
  };

  return (
    <div className={`w-full p-5 rounded-[30px] transition-all duration-300 border relative ${isActive ? 'bg-white border-blue-100 shadow-md' : 'bg-gray-50/50 border-gray-100'}`}>
      
      {/* Inline Toast */}
      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg text-[10px] font-semibold shadow-md bg-red-50 text-red-600 border border-red-200 animate-in fade-in slide-in-from-top-1 duration-300">
          {toast}
        </div>
      )}

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
          <label className={`relative inline-flex items-center cursor-pointer scale-90 ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={handleToggle}
              disabled={isToggling}
              className="sr-only peer" 
            />
            <div className={`relative w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#1e293b] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${isActive ? 'bg-[#1e293b]' : ''}`}>
              {isToggling && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={10} className="animate-spin text-white" />
                </div>
              )}
            </div>
          </label>

          {/* Delete Button */}
          <button 
            onClick={handleDelete} 
            disabled={isDeleting}
            className={`p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
          
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
