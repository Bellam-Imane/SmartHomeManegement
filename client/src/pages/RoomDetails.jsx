import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap } from 'lucide-react';

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
 * La carte des utilisateurs est ancrée définitivement en haut de la 3ème colonne.
 */
const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pieceData, setPieceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const mockResponse = {
          _id: id,
          nomPiece: "Salon",
          type: "Salon",
          appareils: [
            { _id: "ap_cam", nomAppareil: "Caméra Salon", typeAppareil: "CAMERA", status: "ENLIGNE" },
            { _id: "ap_ec", nomAppareil: "Éclairage intelligent", typeAppareil: "ECLAIRAGE", status: "ENLIGNE", intensite: 50 },
            { _id: "ap_tv", nomAppareil: "Télévision", typeAppareil: "MULTIMEDIA", status: "ENLIGNE" },
            { _id: "ap_clim", nomAppareil: "Climatiseur Salon", typeAppareil: "THERMIQUE", status: "ENLIGNE" },
            { _id: "ap_curt", nomAppareil: "Rideaux", typeAppareil: "MOTORISE", status: "ENLIGNE" },
            { _id: "ap_vac", nomAppareil: "Aspirateur", typeAppareil: "ASPIRATEUR", status: "HORSLIGNE", chargeBatterie: 69 }
          ],
          utilisateurs: [
            { _id: "u1", userType: "Administrateur", profile: { nom: "Jeon", prenom: "Justin", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" } },
            { _id: "u2", userType: "Membre", profile: { nom: "Smith", prenom: "Sara", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80" } },
            { _id: "u3", userType: "Invite", profile: { nom: "Davis", prenom: "Alisha", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" } }
          ]
        };
        setPieceData(mockResponse);
      } catch (error) {
        console.error("Erreur lors du chargement des détails", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Chargement...</div>;
  }

  // Extraction et filtrage des appareils pour les distribuer proprement dans les colonnes
  const camera = pieceData?.appareils.find(a => a.typeAppareil === 'CAMERA');
  const eclairage = pieceData?.appareils.find(a => a.typeAppareil === 'ECLAIRAGE');
  const multimedia = pieceData?.appareils.find(a => a.typeAppareil === 'MULTIMEDIA');
  const thermique = pieceData?.appareils.find(a => a.typeAppareil === 'THERMIQUE');
  const motorise = pieceData?.appareils.find(a => a.typeAppareil === 'MOTORISE');
  const aspirateur = pieceData?.appareils.find(a => a.typeAppareil === 'ASPIRATEUR');

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
          <span>Ajouter une appareil</span>
        </button>
      </section>

      {/* ================= LAYOUT MAÎTRISÉ : 3 COLONNES DISTINCTES ================= */}
      <main className="w-full max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* COLONNE 1 : Caméra (Live) en haut + Éclairage (Lampes) en bas */}
          <div className="flex flex-col gap-6 w-full">
            {camera && <CameraCard appareil={camera} />}
            {eclairage && <EclairageCard appareil={eclairage} />}
          </div>

          {/* COLONNE 2 : Télévision (Multimédia) basculée ici + Climatiseur + Rideaux */}
          <div className="flex flex-col gap-6 w-full">
            {multimedia && <MultimediaCard appareil={multimedia} />}
            {thermique && <AirConditionerCard appareil={thermique} />}
            {motorise && <CurtainsCard appareil={motorise} />}
          </div>

          {/* COLONNE 3 : FIXE & ANCRÉE - Utilisateurs en haut + Aspirateur juste en bas */}
          <div className="flex flex-col gap-6 w-full">
            {/* Les utilisateurs restent TOUJOURS ici au sommet du 3ème axe */}
            <RoomUsersCard 
              utilisateurs={pieceData?.utilisateurs}
              onAddUser={() => console.log("Ajouter utilisateur")}
              onEditUser={(u) => console.log("Modifier", u._id)}
              onDeleteUser={(u) => console.log("Supprimer", u._id)}
            />
            {aspirateur && <VacuumCard appareil={aspirateur} />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default RoomDetails;