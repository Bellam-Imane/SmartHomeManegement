import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, SlidersHorizontal, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

import VoiceControlButton from '../components/VoiceControlButton';
import RoomCard from '../components/RoomCard';
import AddRoomModal from '../components/AddRoomModal';
import FilterDropdown from '../components/FilterDropDown'; 
import EditRoomModal from '../components/EditRoomModal'; 

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

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Rooms = () => {
  const [pieces, setPieces] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filtrerType, setFiltrerType] = useState("Tous");
  const [filtrerEtage, setFiltrerEtage] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // États pour la gestion de la modification de la pièce
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Confirm dialog state
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-dismiss error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchPieces = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE}/api/pieces/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const rawPieces = response.data?.data?.pieces ?? response.data?.pieces ?? [];
        setPieces(Array.isArray(rawPieces) ? rawPieces : []);
        setError(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des pièces:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Impossible de charger les pièces.");
      setPieces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial des données au montage du composant
  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  const handleVoiceClick = () => {
    console.log("Microphone cliqué");
  };

  const handleEditRoom = (id) => {
    setSelectedRoomId(id);
    setIsEditModalOpen(true);
  };

  const handleDeleteRoom = async (id) => {
    setConfirmDelete({
      id,
      title: "Supprimer cette pièce ?",
      message: "La pièce et tous ses appareils seront supprimés définitivement.",
      onConfirm: async () => {
        setConfirmDelete(null);
        const roomToDelete = pieces.find(r => r._id === id);
        const roomIndex = pieces.findIndex(r => r._id === id);

        // Optimistic removal
        setPieces(prev => prev.filter(r => r._id !== id));

        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE}/api/pieces/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          showToast(`"${roomToDelete?.nomPiece || 'Pièce'}" supprimée avec succès.`);
        } catch (err) {
          console.error("Erreur lors de la suppression:", err.response?.data || err.message);
          // Rollback
          setPieces(prev => {
            const restored = [...prev];
            if (roomIndex !== -1 && roomToDelete) {
              restored.splice(roomIndex, 0, roomToDelete);
            }
            return restored;
          });
          showToast(err.response?.data?.message || "Impossible de supprimer la pièce.", "error");
        }
      }
    });
  };

  const filtredRooms = pieces.filter(room => {
    if (!room) return false;
    const matchesType = filtrerType === "Tous" || room.type === filtrerType;
    const matchesEtage = filtrerEtage === "Tous" || room.etage === Number(filtrerEtage);
    const matchesSearch = (room.nomPiece || "").toLowerCase().includes(debouncedQuery.toLowerCase());
    return matchesType && matchesEtage && matchesSearch;
  });

  return (
    <div className="p-6 min-h-screen relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg animate-in slide-in-from-right duration-300 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{confirmDelete.title}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">{confirmDelete.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete.onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-5 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="text-sm font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

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
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <Loader2 size={32} className="animate-spin text-gray-400" />
          <span className="font-semibold text-gray-500">Chargement des pièces...</span>
        </div>
      ) : error && pieces.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <AlertTriangle size={40} className="text-red-300" />
          <span className="font-semibold text-gray-500">Impossible de charger les pièces.</span>
          <button
            onClick={fetchPieces}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : filtredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={24} className="text-gray-400" />
          </div>
          <span className="font-semibold text-gray-400">
            {pieces.length === 0 ? "Aucune pièce ajoutée." : "Aucune pièce ne correspond aux filtres."}
          </span>
          {pieces.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              <Plus size={16} />
              Ajouter votre première pièce
            </button>
          )}
        </div>
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

      {/* --- MODAL DE MODIFICATION --- */}
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

    </div>
  );
};

export default Rooms;
