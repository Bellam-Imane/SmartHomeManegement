import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, Maximize, Layers } from "lucide-react";

export default function AddRoomModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nomPiece: "",
    type: "Salon",
    superficie: "",
    etage: 0
  });

  const types = ['Salon', 'Chambre à coucher', 'Cuisine', 'Toilette', 'Bureau', 'Autre'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-lg rounded-[35px] p-10 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Ajouter une pièce</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>

            <div className="space-y-5">
              {/* Nom de la pièce */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-2">
                  <LayoutGrid size={16} /> Nom de la pièce
                </label>
                <input 
                  type="text"
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
                    type="text"
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
                    defaultValue={0}
                    onChange={(e) => setFormData({...formData, etage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button className="w-full mt-10 bg-[#1e293b] text-white py-4 rounded-2xl font-bold hover:bg-[#b5b8c4] transition-all shadow-lg shadow-indigo-100">
              Confirmer l'ajout
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}