import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap } from 'lucide-react';
import axios from 'axios'; 

// Importation des composants de l'application
import RoomUsersCard from '../components/RoomUsersCard';
import VoiceControlButton from '../components/VoiceControlButton';
import AirConditionerCard from '../components/AirConditionerCard';
import CameraCard from '../components/CameraCard';
import CurtainsCard from '../components/CurtainsCard';
import EclairageCard from '../components/EclairageCard';
import MultimediaCard from '../components/MultimediaCard';
import VacuumCard from '../components/VacuumCard';
import AddAppareilModal from '../components/AddAppareilModal'; 

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pieceData, setPieceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomAppareil: '',
    typeAppareil: 'ECLAIRAGE',
    marque: ''
  });

  // Chargement des donnees de la piece et des appareils associes
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`http://localhost:5000/api/pieces/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let data = response.data && response.data.data ? response.data.data : response.data;
        
        // CORRECTION ICI: Hydratation robuste et securisee des appareils
        if (data && Array.isArray(data.appareils) && data.appareils.length > 0) {
          // On verifie si le premier element est un ID (string) pour lancer le chargement complet
          if (typeof data.appareils[0] === 'string') {
            const requests = data.appareils.map(appId => 
              axios.get(`http://localhost:5000/api/appareils/${appId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(res => res.data.data || res.data)
              .catch((err) => {
                console.error(`Erreur chargement appareil ${appId}:`, err);
                return null;
              })
            );
            
            const fullAppareils = await Promise.all(requests);
            // On ne garde que les appareils qui ont ete recuperes avec succes
            data.appareils = fullAppareils.filter(app => app !== null);
          }
        } else {
          // Securite au cas ou appareils est undefined ou null
          data.appareils = [];
        }

        setPieceData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des details de la piece:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  // Mise a jour d'un appareil et synchronisation avec le backend
  const handleUpdateAppareil = async (appareilId, updatedAppareilData) => {
    try {
      setPieceData((prevData) => {
        if (!prevData) return prevData;
        const updatedAppareils = (prevData.appareils || []).map((app) => 
          (app._id === appareilId || app.id === appareilId) ? { ...app, ...updatedAppareilData } : app
        );
        return { ...prevData, appareils: updatedAppareils };
      });

      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/appareils/${appareilId}`, updatedAppareilData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erreur de synchronisation de l'appareil:", error);
    }
  };

  // Creation d'un nouvel appareil via le formulaire modal
  const handleCreateAppareil = async (e) => {
    e.preventDefault(); 
    try {
      const payload = { ...formData, piece: id };
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/appareils', payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setPieceData((prevData) => {
          if (!prevData) return prevData;
          const appareilsActuels = Array.isArray(prevData.appareils) ? prevData.appareils : [];
          return {
            ...prevData,
            appareils: [...appareilsActuels, response.data.data]
          };
        });
        setIsModalOpen(false);
        setFormData({ nomAppareil: '', typeAppareil: 'ECLAIRAGE', marque: '' });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'appareil:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Chargement...</div>;
  }

  const appareilsList = Array.isArray(pieceData?.appareils) ? pieceData.appareils : [];

  // Filtrage des appareils par type (securise avec optionnel chaining)
  const visas = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'CAMERA');
  const eclairages = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ECLAIRAGE');
  const multimedias = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MULTIMEDIA');
  const thermiques = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'THERMIQUE');
  const motorises = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MOTORISE');
  const aspirateurs = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ASPIRATEUR');

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 font-sans select-none relative">
      
      {/* Header de la page */}
      <header className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/home/rooms')} className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 cursor-pointer">
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {pieceData?.nomPiece || pieceData?.nom || "Salon"}
            </h1>
            <span className="text-sm font-semibold text-gray-400 mt-0.5">
              {appareilsList.length} appareils connectés
            </span>
          </div>
        </div>
        <VoiceControlButton />
      </header>

      {/* Informations globales de la piece */}
      <section className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
            <Thermometer size={18} className="text-orange-500" />
            <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
              Température intérieure <strong className="text-sm font-extrabold text-gray-800 mt-1">24°C</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
            <Zap size={18} className="text-amber-500" />
            <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
              Énergie consommée <strong className="text-sm font-extrabold text-gray-800 mt-1">13 kwh</strong>
            </span>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#20242c] hover:bg-[#2c323d] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2.5 shadow-md transition-all cursor-pointer">
          <Plus size={16} /> <span>Ajouter un appareil</span>
        </button>
      </section>

      {/* Grid principal contenant les colonnes de cartes */}
      <main className="w-full max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* Colonne 1 : Caméras et Éclairages */}
          <div className="flex flex-col gap-6 w-full text-left">
            {visas.length > 0 && (
              <CameraCard cameraData={visas} imageSrc="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80" onUpdateAppareil={handleUpdateAppareil} />
            )}
            {eclairages.length > 0 && (
              <EclairageCard bulbsData={eclairages} onUpdateAppareil={handleUpdateAppareil} />
            )}
          </div>

          {/* Colonne 2 : Multimedia, Climatisation et Volets */}
          <div className="flex flex-col gap-6 w-full text-left">
            {multimedias.length > 0 && (
              <MultimediaCard multimediaData={multimedias} onUpdateAppareil={handleUpdateAppareil} />
            )}
            {thermiques.length > 0 && (
              <AirConditionerCard acData={thermiques} onUpdateAppareil={handleUpdateAppareil} />
            )}
            {motorises.length > 0 && (
              <CurtainsCard curtainsData={motorises} onUpdateAppareil={handleUpdateAppareil} />
            )}
          </div>

          {/* Colonne 3 : Utilisateurs et Aspirateurs */}
          <div className="flex flex-col gap-6 w-full text-left">
            <RoomUsersCard utilisateurs={pieceData?.utilisateurs} onAddUser={() => {}} onEditUser={() => {}} onDeleteUser={() => {}} />
            {aspirateurs.length > 0 && (
              <VacuumCard vacuumData={aspirateurs} onUpdateAppareil={handleUpdateAppareil} />
            )}
          </div>

        </div>
      </main>

      {/* Modal d'ajout d'appareil */}
      <AddAppareilModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateAppareil} formData={formData} setFormData={setFormData} />
    </div>
  );
};

export default RoomDetails;