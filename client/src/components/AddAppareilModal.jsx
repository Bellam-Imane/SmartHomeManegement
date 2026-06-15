import React from 'react';
import { X, Loader2 } from 'lucide-react';

/**
 * COMPOSANTE ADDAPPAREILMODAL : Version corrigée avec intégration complète des types d'appareils.
 */
const AddAppareilModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData,
  isLoading = false
}) => {
  if (!isOpen) return null;

  // Fonction interne pour intercepter le clic et s'assurer que l'événement se déclenche
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis depuis le composant AddAppareilModal avec le type :", formData.typeAppareil);
    onSubmit(e); // Appel de la fonction parente handleCreateAppareil
  };

  return (
    // Ajout de backdrop-blur-md pour un effet de flou moderne sur l'arrière-plan
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100 flex flex-col items-start animate-scale-in">
        
        {/* En-tête de la modal */}
        <div className="flex justify-between items-center w-full mb-6">
          <h2 className="text-xl font-black text-gray-800">Nouvel Appareil</h2>
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Formulaire lié à la fonction locale */}
        <form onSubmit={handleLocalSubmit} className="w-full flex flex-col gap-4 text-left">
          
          {/* 1. Nom de l'appareil */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom de l'appareil</label>
            <input 
              type="text" 
              value={formData.nomAppareil}
              onChange={(e) => setFormData({ ...formData, nomAppareil: e.target.value })}
              placeholder="Ex: Climatiseur Principal"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* 2. Marque */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marque (Optionnel)</label>
            <input 
              type="text" 
              value={formData.marque}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              placeholder="Ex: LG, Samsung..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {/* 3. Type d'appareil (Version corrigée et synchronisée avec le Backend) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type d'appareil</label>
            <div className="relative">
              <select 
                value={formData.typeAppareil}
                onChange={(e) => setFormData({ ...formData, typeAppareil: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none"
              >
                <option value="ECLAIRAGE">Éclairage</option>
                <option value="CAMERA">Caméra de Sécurité</option>
                <option value="MULTIMEDIA">Multimédia (TV)</option>
                <option value="THERMIQUE">Thermique (Climatiseur)</option>
                <option value="MOTORISE">Motorisé (Rideaux)</option>
                <option value="ASPIRATEUR">Aspirateur Robot</option>
                <option value="SECURITE">Sécurité (Alarme)</option>
                <option value="PORTE">Porte Intelligente</option>
                <option value="CAPTEUR">Capteur</option>
              </select>
              
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Bouton de confirmation forcé en type="submit" */}
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 bg-[#20242c] hover:bg-[#2c323d] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isLoading ? 'Ajout en cours...' : "Confirmer l'ajout"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddAppareilModal;