import React from 'react';
import { X } from 'lucide-react';

/**
 * COMPOSANTE ADDAPPAREILMODAL : Version corrigée avec flou d'arrière-plan et soumission garantie.
 */
const AddAppareilModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData 
}) => {
  if (!isOpen) return null;

  // Fonction interne pour intercepter le clic et s'assurer que l'événement se déclenche
  const handleLocalSubmit = (e) => {
    e.preventDefault();
    console.log("Formulaire soumis depuis le composant AddAppareilModal !");
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
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Formulaire lié à la fonction locale */}
        <form onSubmit={handleLocalSubmit} className="w-full flex flex-col gap-4 text-left">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom de l'appareil</label>
            <input 
              type="text" 
              value={formData.nomAppareil}
              onChange={(e) => setFormData({ ...formData, nomAppareil: e.target.value })}
              placeholder="Ex: Climatiseur Principal"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marque (Optionnel)</label>
            <input 
              type="text" 
              value={formData.marque}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              placeholder="Ex: LG, Samsung..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type d'appareil</label>
            <div className="relative">
              <select 
                value={formData.typeAppareil}
                onChange={(e) => setFormData({ ...formData, typeAppareil: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-hidden focus:border-gray-400 appearance-none cursor-pointer"
              >
                <option value="ECLAIRAGE">Éclairage</option>
                <option value="CAMERA">Caméra de Sécurité</option>
                <option value="MULTIMEDIA">Multimédia (TV)</option>
                <option value="THERMIQUE">Thermique (Climatiseur)</option>
                <option value="MOTORISE">Motorisé (Rideaux)</option>
                <option value="ASPIRATEUR">Aspirateur Robot</option>
              </select>
            </div>
          </div>

          {/* Bouton de confirmation forcé en type="submit" */}
          <button 
            type="submit"
            className="w-full mt-2 bg-[#20242c] hover:bg-[#2c323d] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm cursor-pointer active:scale-[0.99]"
          >
            Confirmer l'ajout
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddAppareilModal;