import React, { useState, useEffect } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

import VoiceControlButton from '../components/VoiceControlButton';
import RoomCard from '../components/RoomCard';
import AddRoomModal from '../components/AddRoomModal';
import FilterDropdown from '../components/FilterDropDown';
import EditRoomModal from '../components/EditRoomModal'; 
import CurtainsCard from '../components/CurtainsCard'; 


// Importation des images des pièces depuis les assets
import salonImg from '../assets/images/salonImg.png';
import chambreImg from '../assets/images/chambreImg.png';
import cuisineImg from '../assets/images/cuisineImg.png';
import defaultImg from '../assets/images/salonImg.png'; 

// Correspondance entre le type de pièce du schéma et l'image correspondante
const roomImages = {
  "Salon": salonImg,
  "Chambre à coucher": chambreImg,
  "Cuisine": cuisineImg,
  "Bureau": defaultImg, 
  "Autre": defaultImg
};

const Rooms = () => {
  const testCurtainsData = [
  { 
    nomAppareil: "Rideau Motorisé Salon", 
    status: "ENLIGNE", 
    marque: "Somfy",
    pourcentageOuverture: 60, 
    estVerrouille: false 
  }
];

  // États pour stocker les données, le chargement et les modaux/filtres
  const [pieces, setPieces] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtrerType, setFiltrerType] = useState("Tous");
  const [filtrerEtage, setFiltrerEtage] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState(""); 

  // États pour la gestion de la modification de la pièce
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedRoomId, setSelectedRoomId] = useState(null);  

  /**
   * Fonction pour récupérer toutes les pièces depuis le backend
   */
  const fetchPieces = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.get("http://localhost:5000/api/pieces/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPieces(response.data.pieces); 
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des pièces:", err.response?.data || err.message);
    } finally {
      setLoading(false); 
    }
  };

  // Chargement initial des données au montage du composant
  useEffect(() => {
    fetchPieces();
  }, []);

  const handleVoiceClick = () => {
    console.log("Microphone cliqué");
  };

  /**
   * Ouvrir le modal de modification et enregistrer l'ID sélectionné
   */
  const handleEditRoom = (id) => {
    setSelectedRoomId(id);
    setIsEditModalOpen(true); // Active l'affichage du modal
  };

  /**
   * Supprimer une pièce définitivement après confirmation
   */
  const handleDeleteRoom = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette pièce définitivement ?")) {
      try {
        const token = localStorage.getItem("token");
        
        await axios.delete(`http://localhost:5000/api/pieces/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filtrer l'état local pour retirer la pièce supprimée sans refaire d'appel API
        setPieces(pieces.filter(room => room._id !== id));
        alert("Pièce supprimée avec succès !");
        
      } catch (err) {
        console.error("Erreur lors de la suppression:", err.response?.data || err.message);
        alert("Impossible de supprimer la pièce.");
      }
    }
  };

  /**
   * Logique de filtrage et de recherche combinée sur la liste des pièces
   */
  const filtredRooms = pieces.filter(room => {
    const matchesType = filtrerType === "Tous" || room.type === filtrerType;
    const matchesEtage = filtrerEtage === "Tous" || room.etage === Number(filtrerEtage);
    const matchesSearch = room.nomPiece.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesEtage && matchesSearch;
  });

  return (
    <div className="p-6 min-h-screen relative">
      {/* --- En-tête / Header --- */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Pièces</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Gérez les appareils de chaque pièce.</p>
        </div>
        <VoiceControlButton onClick={handleVoiceClick} />
      </header>

      {/* --- Barre d'actions (Recherche, Ajout, Filtres) --- */}
      <div className="mt-10 flex items-center justify-end gap-4">
        {/* Champ de recherche par texte */}
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="chercher une pièce ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400"
          />
        </div>
        
        {/* Bouton et Modal d'ajout d'une nouvelle pièce */}
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-3 bg-[#1e293b] text-white rounded-full font-semibold shadow-md hover:bg-[#334155] transition-all whitespace-nowrap text-base"
          >
            <Plus size={20} />
            <span>Ajouter une pièce</span>
          </button>
          
          <AddRoomModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onRoomAdded={fetchPieces} 
          />
        </div>
        
        {/* Bouton et Menu déroulant pour les filtres */}
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-3 text-gray-700 hover:bg-gray-200 rounded-full transition-colors shadow-sm bg-white border border-gray-100">
            <SlidersHorizontal size={24} />
          </button>

          <FilterDropdown
            isOpen={isFilterOpen}
            selectedType={filtrerType}   
            selectedEtage={filtrerEtage} 
            onSelectType={(type) => setFiltrerType(type)} 
            onSelectEtage={(etage) => setFiltrerEtage(etage)} 
            onClose={() => setIsFilterOpen(false)} 
          />
        </div>
      </div>

      {/* --- Grille d'affichage des cartes de pièces --- */}
      {loading ? (
        <div className="text-center mt-20 font-semibold text-gray-500">Chargement des pièces...</div>
      ) : filtredRooms.length === 0 ? (
        <div className="text-center mt-20 font-semibold text-gray-400">Aucune pièce trouvée.</div>
      ) : (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtredRooms.map((room) => (
            <RoomCard 
              key={room._id} 
              id={room._id}
              name={room.nomPiece} 
              devices={room.appareils?.length || 0} 
              image={roomImages[room.type] || defaultImg} 
              onEdit={handleEditRoom}
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {/* --- ✅ MODAL AVEC RESET AUTOMATIQUE CORRIGÉ --- */}
      {isEditModalOpen && selectedRoomId && (
        <EditRoomModal 
          key={selectedRoomId} 
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoomId(null);
          }}
          roomId={selectedRoomId}
          onRoomUpdated={fetchPieces}
        />
      )}

      <CurtainsCard curtainsData={testCurtainsData} />

    </div>
  );
};

export default Rooms;