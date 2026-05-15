import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditRoomModal = ({ isOpen, onClose, roomId, onRoomUpdated }) => {
  // Initialisation de l'état du formulaire avec des valeurs vides
  const [formData, setFormData] = useState({
    nomPiece: '',
    type: '',
    superficie: '',
    etage: 0
  });
  
  const [loading, setLoading] = useState(false);       // Pour le bouton "Confirmer"
  const [fetching, setFetching] = useState(true);       // Bloque l'affichage tant que les infos chargent

  /**
   * Effet pour charger les détails de la pièce sélectionnée dès l'ouverture du modal
   */
  useEffect(() => {
    let isMounted = true;

    if (isOpen && roomId) {
      setFetching(true); // Activer le spinner au début
      
      const fetchRoomDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          
          // Requête pour récupérer les données de la carte cliquée
          const response = await axios.get(`http://localhost:5000/api/pieces/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Vérification de la réponse dans la Console F12
          console.log("Données de la pièce reçues :", response.data);

          if (response.data.success && isMounted) {
            const room = response.data.piece; 
            
            if (room) {
              // Remplissage complet des inputs avec les valeurs de la BDD
              setFormData({
                nomPiece: room.nomPiece || '',
                type: room.type || '',
                superficie: room.superficie || '',
                etage: room.etage !== undefined ? room.etage : 0
              });
            }
            setFetching(false); // On cache le spinner et on affiche le formulaire rempli !
          }
        } catch (err) {
          console.error("Erreur lors du chargement des détails :", err.message);
          setFetching(false);
        }
      };
      
      fetchRoomDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, roomId]);

  /**
   * Soumettre les modifications au serveur
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(`http://localhost:5000/api/pieces/${roomId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Pièce modifiée avec succès !");
      onRoomUpdated(); 
      onClose();       
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err.message);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-[45px] p-8 w-full max-w-md shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold text-lg"
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Modifier la pièce</h3>
        
        {/* Spinner de chargement : empêche de voir le formulaire vide */}
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-400">Chargement des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Nom de la pièce</label>
              <input 
                type="text" 
                value={formData.nomPiece}
                onChange={(e) => setFormData({...formData, nomPiece: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="" disabled>Sélectionnez un type</option>
                <option value="Salon">Salon</option>
                <option value="Chambre à coucher">Chambre à coucher</option>
                <option value="Cuisine">Cuisine</option>
                <option value="Bureau">Bureau</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Superficie (m²)</label>
                <input 
                  type="number" 
                  value={formData.superficie}
                  onChange={(e) => setFormData({...formData, superficie: e.target.value === '' ? '' : Number(e.target.value)})}
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Étage</label>
                <input 
                  type="number" 
                  value={formData.etage}
                  onChange={(e) => setFormData({...formData, etage: e.target.value === '' ? '' : Number(e.target.value)})}
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-[#1e293b] text-white font-bold rounded-2xl hover:bg-[#334155] transition-all text-sm shadow-md"
            >
              {loading ? "Modification..." : "Confirmer les modifications"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditRoomModal;