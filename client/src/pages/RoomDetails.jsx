import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap } from 'lucide-react';
import axios from 'axios'; // Importation d'axios pour les requêtes HTTP

// ================= IMPORTATION DES COMPOSANTS =================
import RoomUsersCard from '../components/RoomUsersCard';
import VoiceControlButton from '../components/VoiceControlButton';
import AirConditionerCard from '../components/AirConditionerCard';
import CameraCard from '../components/CameraCard';
import CurtainsCard from '../components/CurtainsCard';
import EclairageCard from '../components/EclairageCard';
import MultimediaCard from '../components/MultimediaCard';
import VacuumCard from '../components/VacuumCard';

/**
 * COMPOSANTE ROOMDETAILS : Structure en 3 colonnes fixes.
 * Gère l'affichage et la mise à jour des appareils d'une pièce via le serveur.
 */
const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pieceData, setPieceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Récupération des détails de la pièce depuis le backend
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        // Remplacement du mockResponse par un appel API réel vers le serveur Node.js
        // Ajustez l'URL globale selon la configuration de votre serveur
        const response = await axios.get(`http://localhost:5000/api/pieces/${id}`);
        
        if (response.data && response.data.data) {
          setPieceData(response.data.data);
        } else {
          setPieceData(response.data); // Cas où la data est renvoyée directement
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails depuis le serveur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  // Fonction centrale pour modifier l'état d'un appareil connecté (Clim, Rideau, Caméra...)
  const handleUpdateAppareil = async (appareilId, updatedAppareilData) => {
    try {
      // 1. Mise à jour optimiste de l'interface en local pour éviter les latences visuelles
      setPieceData((prevData) => {
        if (!prevData) return prevData;
        
        const updatedAppareils = prevData.appareils.map((app) => 
          (app._id === appareilId || app.id === appareilId) ? { ...app, ...updatedAppareilData } : app
        );
        
        return { ...prevData, appareils: updatedAppareils };
      });

      // 2. Envoi de la modification vers la route PUT du serveur (Option 1 qu'on a créée)
      await axios.put(`http://localhost:5000/api/appareils/${appareilId}`, updatedAppareilData);
      console.log(`Appareil [${appareilId}] synchronisé avec succès dans la base de données.`);

    } catch (error) {
      console.error("Erreur lors de la synchronisation avec le serveur:", error);
      // En cas d'erreur réseau, il est possible de rafraîchir la page pour restaurer l'ancien état
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Chargement...</div>;
  }

  // Extraction et filtrage des appareils pour les distribuer proprement dans les colonnes
  const camera = pieceData?.appareils?.find(a => a.typeAppareil === 'CAMERA');
  const eclairage = pieceData?.appareils?.find(a => a.typeAppareil === 'ECLAIRAGE');
  const multimedia = pieceData?.appareils?.find(a => a.typeAppareil === 'MULTIMEDIA');
  const thermique = pieceData?.appareils?.find(a => a.typeAppareil === 'THERMIQUE');
  const motorise = pieceData?.appareils?.find(a => a.typeAppareil === 'MOTORISE');
  const aspirateur = pieceData?.appareils?.find(a => a.typeAppareil === 'ASPIRATEUR');

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 font-sans select-none">
      
      {/* ================= HEADER PRINCIPAL ================= */}
      <header className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/home/rooms')} 
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {pieceData?.nomPiece}
            </h1>
            <span className="text-sm font-semibold text-gray-400 mt-0.5">
              {pieceData?.appareils?.length || 0} appareils connectés
            </span>
          </div>
        </div>

        <div>
          <VoiceControlButton />
        </div>
      </header>

      {/* ================= SUB-HEADER (STATS) ================= */}
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
              <strong className="text-sm font-extrabold text-gray-800 mt-1">13 kwh</strong>
            </span>
          </div>
        </div>

        <button className="bg-[#20242c] hover:bg-[#2c323d] text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2.5 shadow-md active:scale-[0.98] transition-all">
          <Plus size={16} />
          <span>Ajouter un appareil</span>
        </button>
      </section>

      {/* ================= LAYOUT MAÎTRISÉ : 3 COLONNES DISTINCTES ================= */}
      <main className="w-full max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* COLONNE 1 : Caméra (Live) en haut + Éclairage (Lampes) en bas */}
          <div className="flex flex-col gap-6 w-full">
            {camera && (
              <CameraCard 
                appareil={camera} 
                imageSrc="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
            {eclairage && (
              <EclairageCard 
                appareil={eclairage} 
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
          </div>

          {/* COLONNE 2 : Télévision (Multimédia) + Climatiseur + Rideaux */}
          <div className="flex flex-col gap-6 w-full">
            {multimedia && (
              <MultimediaCard 
                appareil={multimedia} 
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
            {thermique && (
              <AirConditionerCard 
                appareil={thermique} 
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
            {motorise && (
              <CurtainsCard 
                appareil={motorise} 
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
          </div>

          {/* COLONNE 3 : FIXE & ANCRÉE - Utilisateurs en haut + Aspirateur juste en bas */}
          <div className="flex flex-col gap-6 w-full">
            <RoomUsersCard 
              utilisateurs={pieceData?.utilisateurs}
              onAddUser={() => console.log("Ajouter utilisateur")}
              onEditUser={(u) => console.log("Modifier", u._id)}
              onDeleteUser={(u) => console.log("Supprimer", u._id)}
            />
            {aspirateur && (
              <VacuumCard 
                appareil={aspirateur} 
                onUpdateAppareil={handleUpdateAppareil} 
              />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default RoomDetails;