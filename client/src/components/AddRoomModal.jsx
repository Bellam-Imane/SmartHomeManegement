import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, Maximize, Layers } from "lucide-react";
import axios from "axios"; // ✅ Requis pour envoyer les données au backend

export default function AddRoomModal({ isOpen, onClose, onRoomAdded }) {
  // Initialisation du formulaire avec les champs exacts attendus par le backend
  const [formData, setFormData] = useState({
    nomPiece: "",
    type: "Salon", // ✅ Correspond exactement au champ 'type' de votre PieceSchema
    superficie: "",
    etage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const types = ['Salon', 'Chambre à coucher', 'Cuisine', 'Bureau', 'Autre'];

  /**
   * Fonction pour soumettre le formulaire et enregistrer la pièce en BDD
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    setLoading(true);
    setError("");

    try {
      // Récupération du token JWT stocké lors du login
      const token = localStorage.getItem("token"); 

      // Envoi de la requête POST vers le serveur avec les headers d'authentification
      const response = await axios.post(
        "http://localhost:5000/api/pieces/ajouter", 
        {
          ...formData,
          superficie: Number(formData.superficie) || 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ Authentification passée au middleware
          }
        }
      );

      // Si la création réussit (Statut 201 Created)
      if (response.status === 201) {
        if (onRoomAdded) onRoomAdded(); // ✅ Actualiser la liste des pièces sur l'écran principal
        onClose(); // Fermer le modal automatiquement
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de la pièce:", err.response?.data);
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          
          {/* ✅ Remplacement du div par un élément 'form' lié à handleSubmit */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-lg rounded-[35px] p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Ajouter une pièce</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>

            {/* Affichage des messages d'erreur du serveur si besoin */}
            {error && <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>}

            <div className="space-y-5">
              {/* Nom de la pièce */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                  <LayoutGrid size={16} /> Nom de la pièce
                </label>
                <input 
                  type="text"
                  required // Rendre le champ obligatoire côté client
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Salon Principal"
                  onChange={(e) => setFormData({...formData, nomPiece: e.target.value})}
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">Type</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Superficie */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                    <Maximize size={16} /> Superficie (m²)
                  </label>
                  <input 
                    type="number"
                    required // Requis par votre PieceSchema
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500"
                    placeholder="25"
                    onChange={(e) => setFormData({...formData, superficie: e.target.value})}
                  />
                </div>
                {/* Etage */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                    <Layers size={16} /> Étage
                  </label>
                  <input 
                    type="number"
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500"
                    value={formData.etage}
                    onChange={(e) => setFormData({...formData, etage: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            {/* Bouton de soumission dynamique */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-10 bg-[#1e293b] text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Ajout en cours..." : "Confirmer l'ajout"}
            </button>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}