import React, { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import VoiceControlButton from '../components/VoiceControlButton';
import RoomCard from '../components/RoomCard';
import AddRoomModal from '../components/AddRoomModal';


import salonImg from '../assets/images/salonImg.png';
import chambreImg from '../assets/images/chambreImg.png';
import cuisineImg from '../assets/images/cuisineImg.png';

const Rooms = () => {
  
  const handleVoiceClick = () => {
    console.log("Microphone cliqué");
  };

  const roomsData = [
    {
      id: 1,
      name: 'Salon',
      devices: 8,
      image: salonImg ,
    },
    {
      id: 2,
      name: 'Chambre à coucher',
      devices: 4,
      image: chambreImg,
    },
    {
      id: 3,
      name: 'Cuisine',
      devices: 6,
      
      image: cuisineImg ,
    }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Fonctions de gestion
  const handleEditRoom = (id) => {
    console.log("Action: Modifier la pièce ID ->", id);
  };

  const handleDeleteRoom = (id) => {
    console.log("Action: Supprimer la pièce ID ->", id);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* --- Header --- */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mes Pièces</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Gérez les appareils de chaque pièce.</p>
        </div>
        <VoiceControlButton onClick={handleVoiceClick} />
      </header>

      {/* --- Actions Bar --- */}
      <div className="mt-10 flex items-center justify-end gap-4">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="chercher une pièce ..." 
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all placeholder:text-gray-400"
          />
        </div>

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
        />

        <button className="p-3 text-gray-700 hover:bg-gray-200 rounded-full transition-colors shadow-sm bg-white border border-gray-100">
          <SlidersHorizontal size={24} />
        </button>
      </div>

      {/* --- 3. Grille des cartes --- */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {roomsData.map((room) => (
          <RoomCard 
            key={room.id}
            id={room.id}
            name={room.name}
            devices={room.devices}
            image={room.image}
            onEdit={handleEditRoom}
            onDelete={handleDeleteRoom}
          />
        ))}
      </div>
    </div>
  );
};

export default Rooms;