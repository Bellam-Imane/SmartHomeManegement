import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap, ChevronDown } from 'lucide-react';
import axios from 'axios';

import RoomUsersCard     from '../components/RoomUsersCard';
import VoiceControlButton from '../components/VoiceControlButton';
import AirConditionerCard from '../components/AirConditionerCard';
import CameraCard        from '../components/CameraCard';
import CurtainsCard      from '../components/CurtainsCard';
import EclairageCard     from '../components/EclairageCard';
import MultimediaCard    from '../components/MultimediaCard';
import VacuumCard        from '../components/VacuumCard';
import AddAppareilModal  from '../components/AddAppareilModal';

const RoomDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  // --- États principaux ---
  const [pieceData, setPieceData]                 = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  // État du formulaire d'ajout d'appareil
  const [formData, setFormData] = useState({
    nomAppareil:  '',
    typeAppareil: 'ECLAIRAGE',
    marque:       ''
  });

  // ─────────────────────────────────────────────
  // Fonction centralisée de chargement des détails
  // ─────────────────────────────────────────────
  const fetchRoomDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/pieces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Normalisation des données retournées par le contrôleur (data ou document direct)
      let data = response.data?.data ?? response.data?.piece ?? response.data;

      // Gestion du cas où le populate backend renverrait uniquement des IDs (Sécurité)
      if (data && Array.isArray(data.appareils) && data.appareils.length > 0) {
        if (typeof data.appareils[0] === 'string') {
          const requests = data.appareils.map(appId =>
            axios
              .get(`http://localhost:5000/api/appareils/${appId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(res => res.data?.data ?? res.data)
              .catch(err => {
                console.error(`Erreur lors du chargement de l'appareil ${appId} :`, err);
                return null;
              })
          );

          const fullAppareils = await Promise.all(requests);
          data.appareils = fullAppareils.filter(app => app !== null);
        }
      } else if (data) {
        data.appareils = [];
      }

      setPieceData(data);
    } catch (error) {
      console.error('Erreur générale lors du chargement de la pièce :', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Chargement initial au montage du composant
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchRoomDetails();
    }
  }, [id, fetchRoomDetails]);

  // ─────────────────────────────────────────────────────────────────
  // Mise à jour d'un appareil (Envoi à l'API puis rafraîchissement)
  // ─────────────────────────────────────────────────────────────────
  const handleUpdateAppareil = async (appareilId, updatedAppareilData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:5000/api/appareils/${appareilId}`,
        updatedAppareilData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const serverDevice = response.data.data;
        setPieceData(prevData => {
          if (!prevData) return prevData;
          const updatedAppareils = (prevData.appareils ?? []).map(app =>
            (app._id === appareilId || app.id === appareilId) ? serverDevice : app
          );
          return { ...prevData, appareils: updatedAppareils };
        });
      }

    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'appareil :', error);
    }
  };

  // ─────────────────────────────────────
  // Création et ajout d'un nouvel appareil
  // ─────────────────────────────────────
  const handleCreateAppareil = async (e) => {
    e.preventDefault();
    try {
      const payload  = { ...formData, piece: id };
      const token    = localStorage.getItem('token');
      
      // Envoi de la requête de création au serveur
      const response = await axios.post(
        'http://localhost:5000/api/appareils',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        // 🌟 ACTION DIRECTE : On force un re-fetch global pour obtenir l'appareil avec ses champs par défaut typés du Backend
        await fetchRoomDetails();

        // Fermeture propre du modal et réinitialisation du formulaire
        setIsModalOpen(false);
        setFormData({ nomAppareil: '', typeAppareil: 'ECLAIRAGE', marque: '' });
      }
    } catch (error) {
      console.error('Erreur réseau lors de l\'ajout de l\'appareil :', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Chargement des appareils...
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Normalisation et filtrage des appareils par catégorie
  // ─────────────────────────────────────────────────────
  const appareilsList = Array.isArray(pieceData?.appareils) ? pieceData.appareils : [];

  const cameras     = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'CAMERA');
  const eclairages  = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ECLAIRAGE');
  const multimedias = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MULTIMEDIA');
  const thermiques  = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'THERMIQUE');
  const motorises   = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MOTORISE');
  const aspirateurs = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ASPIRATEUR');

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 font-sans select-none relative">

      {/* ── En-tête global ── */}
      <header className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home/rooms')}
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 cursor-pointer"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>

          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {pieceData?.nomPiece ?? pieceData?.nom ?? 'Pièce'}
            </h1>
            <span className="text-sm font-semibold text-gray-400 mt-0.5">
              {appareilsList.length} appareils connectés
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 relative">
          <VoiceControlButton />

          <div
            onClick={() => setShowUsersDropdown(prev => !prev)}
            className="flex items-center gap-3 bg-white pl-4 pr-3 py-2 rounded-full shadow-xs border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all select-none"
          >
            <div className="flex -space-x-2.5 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Avatar" />
            </div>

            <span className="text-sm font-bold text-gray-700">Alisha H.</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showUsersDropdown && (
            <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
              <RoomUsersCard
                utilisateurs={pieceData?.utilisateurs ?? []}
                onAddUser={() => {}}
                onEditUser={() => {}}
                onDeleteUser={() => {}}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── Widgets de synthèse ── */}
      <section className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
            <Thermometer size={18} className="text-orange-500" />
            <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
              Température intérieure
              <strong className="text-sm font-extrabold text-gray-800 mt-1">24°C</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
            <Zap size={18} className="text-amber-500" />
            <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
              Énergie consommée
              <strong className="text-sm font-extrabold text-gray-800 mt-1">13 kWh</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#20242c] hover:bg-[#2c323d] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Ajouter un appareil</span>
        </button>
      </section>

      {/* ── Grille principale des appareils ── */}
      <main className="w-full max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-6 auto-rows-auto items-stretch justify-center w-full text-left">

          {/* 1. Caméra */}
          {cameras.length > 0 && (
            <div className="h-[530px] flex w-full">
              <CameraCard
                cameraData={cameras}
                imageSrc="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
                onUpdateAppareil={handleUpdateAppareil}
                className="h-full w-full"
              />
            </div>
          )}

          {/* 2. Éclairage */}
          {eclairages.length > 0 && (
            <div className="h-[530px] flex w-full">
              <EclairageCard
                bulbsData={eclairages}
                onUpdateAppareil={handleUpdateAppareil}
                className="h-full w-full grow"
              />
            </div>
          )}

          {/* 3. Aspirateur */}
          {aspirateurs.length > 0 && (
            <div className="h-[530px] flex w-full">
              <VacuumCard
                vacuumData={aspirateurs}
                onUpdateAppareil={handleUpdateAppareil}
                className="h-full w-full grow"
              />
            </div>
          )}

          {/* 4. Multimédia */}
          {multimedias.length > 0 && (
            <div className="h-[530px] flex w-full">
              <MultimediaCard
                multimediaData={multimedias}
                onUpdateAppareil={handleUpdateAppareil}
                className="h-full w-full"
              />
            </div>
          )}

          {/* 5. Conteneur combiné (Climatiseur + Rideaux) */}
          {(thermiques.length > 0 || motorises.length > 0) && (
            <div className="flex flex-col justify-between gap-6 w-full md:col-span-2 lg:col-span-2 h-full min-h-[530px]">
              
              {/* Climatiseur */}
              {thermiques.length > 0 && (
                <div className="flex w-full">
                  <AirConditionerCard
                    acData={thermiques}
                    onUpdateAppareil={handleUpdateAppareil}
                    className="w-full"
                  />
                </div>
              )}

              {/* Rideaux motorisés */}
              {motorises.length > 0 && (
                <div className="flex w-full">
                  <CurtainsCard
                    curtainsData={motorises}
                    onUpdateAppareil={handleUpdateAppareil}
                    className="w-full"
                  />
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* ── Modal d'ajout d'un nouvel appareil ── */}
      <AddAppareilModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAppareil}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default RoomDetails;