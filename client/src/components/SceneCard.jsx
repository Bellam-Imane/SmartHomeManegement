import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, Trash2, Loader2 } from 'lucide-react'; 
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const SceneCard = ({ title, icon: Icon, desc, sceneId, isActiveByDefault = false, onDelete, onExecute }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [isActive, setIsActive] = useState(isActiveByDefault);
  const [isExecuting, setIsExecuting] = useState(false);
  const [toast, setToast] = useState(null); // { message: string, type: 'error' | 'success' }

  // Ref to prevent duplicate executions from rapid toggle clicks
  const executingRef = useRef(false);

  // Auto-dismiss toast after 3s
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const executeScene = async () => {
    if (!sceneId || executingRef.current) return;
    executingRef.current = true;
    setIsExecuting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/api/scenes/${sceneId}/execute`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setIsActive(true);
        if (onExecute) onExecute(sceneId, res.data.executedActions);
      }
    } catch (err) {
      console.error("[SceneCard] Execute failed:", err.message);
      // Revert toggle on failure
      setIsActive(false);
      showToast("Échec de l'exécution de la scène.");
    } finally {
      setIsExecuting(false);
      executingRef.current = false;
    }
  };

  const handleToggle = () => {
    if (isExecuting) return; // Guard: no action during execution

    if (!isActive) {
      // OFF → ON: execute the scene
      setIsActive(true); // Optimistic update
      executeScene();
    } else {
      // ON → OFF: deactivate locally, no MQTT
      setIsActive(false);
    }
  };

  const handleDelete = async () => {
    if (!sceneId || !window.confirm("Supprimer cette scène ?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/scenes/${sceneId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDelete) onDelete(sceneId);
    } catch (err) {
      console.error("[SceneCard] Delete failed:", err.message);
      showToast("Échec de la suppression de la scène.");
    }
  };

  return (
    <div className={`min-w-[300px] p-7 rounded-[40px] transition-all duration-500 shadow-sm border relative ${isActive ? 'bg-white border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
      
      {/* Inline Toast */}
      {toast && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-lg text-[10px] font-semibold shadow-md animate-in fade-in slide-in-from-top-1 duration-300 ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-start mb-5">
        <div className={`p-3.5 rounded-2xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400'}`}>
          <Icon size={24} />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Delete Button */}
          {sceneId && (
            <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50">
              <Trash2 size={16} />
            </button>
          )}

          {/* Toggle Switch */}
          <label className={`relative inline-flex items-center cursor-pointer ${isExecuting ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <input 
              type="checkbox" 
              checked={isActive} 
              onChange={handleToggle}
              disabled={isExecuting}
              className="sr-only peer" 
            />
            <div className={`relative w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-[#1e293b] ${
              isActive ? 'bg-[#1e293b]' : 'bg-gray-200'
            }`}>
              {/* Spinner inside toggle area during execution */}
              {isExecuting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin text-white" />
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
      
      {/* Scene title */}
      <div className="flex justify-center mt-2 mb-4">
        <h3 className={`font-bold text-xl transition-colors ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </h3>
      </div>

      {/* Active indicator */}
      {isActive && !isExecuting && (
        <div className="flex justify-center mb-2">
          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Scène active</span>
        </div>
      )}

      {/* Executing indicator */}
      {isExecuting && (
        <div className="flex justify-center mb-2">
          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Exécution en cours...</span>
        </div>
      )}
      
      {/* description dropdown */}
      <div className="flex justify-end mt-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown size={18} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown content */}
      <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'max-h-40 mt-3' : 'max-h-0'}`}>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed px-1">
          {desc}
        </p>
      </div>
    </div>
  );
};

export default SceneCard;
