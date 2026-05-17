import React, { useState } from 'react';
import { Wifi, MoreVertical, Edit2, Trash2 } from 'lucide-react';
// 1. Importation du hook de navigation de react-router-dom
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ id, name, devices, image, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  // 2. Initialisation du navigateur de routes
  const navigate = useNavigate();

  // 3. Fonction déclenchée lors du clic sur "Contrôler"
  const handleControlClick = (e) => {
    // Empêche le déclenchement d'autres événements parents si nécessaire
    e.stopPropagation(); 
    
    // 🚨 تـأكـيـد إرسـال الـ ID الـصـحـيـح كـيـفـمـا كـان
    // Si l'id passé est un objet ou s'il y a une divergence, on s'assure d'envoyer la string brute
    const finalId = id?._id || id?.id || id;

    // REDIRECTION CORRIGÉE : Alignée parfaitement sur le Nested Route de App.jsx (/home/rooms/:id)
    navigate(`/home/rooms/${finalId}`); 
  };

  return (
    <div className="group relative w-full h-[340px] rounded-[45px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 p-0 m-0 display-block">
      
      {/* Background Image */}
      <img 
        src={image} 
        alt={name} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
      />

      {/* Options Button */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
          className="p-2 bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 rounded-full hover:bg-white/60 transition-all"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={(e) => { e.stopPropagation(); onEdit(id?._id || id?.id || id); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors duration-150">
              <Edit2 size={16} className="text-indigo-600" />
              <span>Modifier</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(id?._id || id?.id || id); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl">
              <Trash2 size={16} />
              <span>Supprimer</span>
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphism Content Card */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%]">
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[35px] p-6 shadow-xl">
          <div className="flex flex-col items-start text-left">
            <h3 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-gray-700 font-medium">
              <Wifi size={14} className="text-gray-600" />
              <span className="text-[13px]">{devices} appareils connectés</span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            {/* 4. Liaison du bouton avec la fonction de redirection au clic */}
            <button 
              onClick={handleControlClick}
              className="flex items-center justify-center gap-2 py-2.5 px-6 bg-white text-gray-900 rounded-full font-bold text-xs shadow-sm hover:bg-indigo-600 hover:text-white transition-all duration-300 group/btn border border-gray-100"
            >
              <span>Contrôler</span>
              <span className="text-sm transition-transform group-hover/btn:translate-x-1">≫</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;