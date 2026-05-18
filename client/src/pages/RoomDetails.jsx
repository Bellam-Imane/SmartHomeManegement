import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap, ChevronDown } from 'lucide-react';
import axios from 'axios'; 

// Importation des composants de l'interface utilisateur
import RoomUsersCard from '../components/RoomUsersCard';
import VoiceControlButton from '../components/VoiceControlButton';
import AirConditionerCard from '../components/AirConditionerCard';
import CameraCard from '../components/CameraCard';
import CurtainsCard from '../components/CurtainsCard';
import EclairageCard from '../components/EclairageCard';
import MultimediaCard from '../components/MultimediaCard';
import VacuumCard from '../components/VacuumCard';
import AddAppareilModal from '../components/AddAppareilModal'; 

// ─── Constantes de dimensionnement du layout ──────────────────────────────────
// CARD_H : hauteur commune pour caméra, lampe, tv, aspirateur.
// GAP    : gap-6 = 24px entre les cartes.
//
// Règle de composition verticale :
//   • Colonne gauche  : caméra (CARD_H) + GAP + lampe (CARD_H)  = 2×CARD_H + GAP
//   • Colonne droite  :
//       - Ligne haute : tv + aspirateur côte à côte              → CARD_H
//       - Ligne basse : climatiseur + rideaux empilés             → hauteur restante
//         ↳ hauteur restante = (2×CARD_H + GAP) - CARD_H - GAP  = CARD_H
//         ↳ chaque carte     = (CARD_H - GAP) / 2               = LOWER_H
//   ↳ Les deux colonnes ont la même hauteur totale : 2×CARD_H + GAP ✓
//
// Règle de composition horizontale :
//   • Climatiseur & rideaux : w-full sur flex-1 → même largeur que tv + aspirateur
// ──────────────────────────────────────────────────────────────────────────────
const CARD_H  = 530;  // px — caméra, lampe, tv, aspirateur
const GAP     = 24;   // px — gap-6
const LOWER_H = Math.round((CARD_H - GAP) / 2); // 253 px — climatiseur & rideaux

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // États pour la gestion des données, du chargement et des modaux
  const [pieceData, setPieceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  // État du formulaire pour l'ajout d'un nouvel appareil
  const [formData, setFormData] = useState({
    nomAppareil: '',
    typeAppareil: 'ECLAIRAGE',
    marque: ''
  });

  // Effet pour charger les détails de la pièce et hydrater les appareils liés
  useEffect(() => {
    const fetchRoomDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`http://localhost:5000/api/pieces/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let data = response.data && response.data.data ? response.data.data : response.data;
        
        // Si les appareils sont reçus sous forme d'IDs (chaînes), on effectue des requêtes parallèles pour récupérer les objets complets
        if (data && Array.isArray(data.appareils) && data.appareils.length > 0) {
          if (typeof data.appareils[0] === 'string') {
            const requests = data.appareils.map(appId => 
              axios.get(`http://localhost:5000/api/appareils/${appId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
              .then(res => res.data.data || res.data)
              .catch((err) => {
                console.error(`Erreur lors du chargement de l'appareil ${appId}:`, err);
                return null;
              })
            );
            
            const fullAppareils = await Promise.all(requests);
            data.appareils = fullAppareils.filter(app => app !== null);
          }
        } else {
          data.appareils = [];
        }

        setPieceData(data);
      } catch (error) {
        console.error("Erreur générale de chargement du composant:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoomDetails();
    }
  }, [id]);

  // Fonction pour mettre à jour l'état local et synchroniser les modifications avec l'API backend
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
      console.error("Erreur de synchronisation réseau de l'appareil:", error);
    }
  };

  // Fonction pour créer un nouvel appareil et l'ajouter dynamiquement à la pièce
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
      console.error("Erreur d'ajout réseau de l'appareil:", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Chargement...</div>;
  }

  const appareilsList = Array.isArray(pieceData?.appareils) ? pieceData.appareils : [];

  // Filtrage des appareils par type (conversion en majuscules pour éviter les conflits de casse)
  const visas      = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'CAMERA');
  const eclairages = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ECLAIRAGE');
  const multimedias = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MULTIMEDIA');
  const thermiques = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'THERMIQUE');
  const motorises  = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MOTORISE');
  const aspirateurs = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ASPIRATEUR');

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 font-sans select-none relative">
      
      {/* Entête globale de la page domotique */}
      <header className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8 relative">
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
        
        {/* Contrôles d'accès et profils utilisateurs (Dropdown/Popover) */}
        <div className="flex items-center gap-6 relative">
          <VoiceControlButton />

          <div 
            onClick={() => setShowUsersDropdown(!showUsersDropdown)}
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
              <RoomUsersCard utilisateurs={pieceData?.utilisateurs || []} onAddUser={() => {}} onEditUser={() => {}} onDeleteUser={() => {}} />
            </div>
          )}
        </div>
      </header>

      {/* Widgets de synthèse de l'état global de l'environnement */}
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

      {/* ─── Layout principal ────────────────────────────────────────────────────
           Structure asymétrique en deux colonnes :
           • Colonne gauche  (lg:w-[420px]) : caméra + lampe, chacune à CARD_H px
           • Colonne droite  (flex-1)       :
               - Ligne haute  : tv + aspirateur côte à côte, hauteur = CARD_H px
               - Ligne basse  : climatiseur + rideaux empilés
                   ↳ hauteur totale = CARD_H px (= tv + GAP + aspirateur n'est
                     pas le cas ici car tv et aspirateur sont côte-à-côte et non
                     empilés ; la hauteur totale de la ligne basse doit simplement
                     correspondre à CARD_H pour aligner les deux colonnes)
                   ↳ chaque carte = LOWER_H = (CARD_H - GAP) / 2 px
      ─────────────────────────────────────────────────────────────────────────── */}
      <main className="w-full max-w-[1340px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full">
          
          {/* ═══════════════════════════════════════════════════════════════════
               COLONNE GAUCHE — Caméra et Éclairage, hauteur uniforme CARD_H px
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-start gap-6 w-full lg:w-[420px] shrink-0 text-left h-auto">

            {/* Carte Caméra — hauteur identique aux cartes tv et aspirateur */}
            {visas.length > 0 && (
              <div style={{ height: `${CARD_H}px` }} className="w-full">
                <CameraCard 
                  cameraData={visas} 
                  imageSrc="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80" 
                  onUpdateAppareil={handleUpdateAppareil} 
                  className="h-full w-full" 
                />
              </div>
            )}

            {/* Carte Éclairage — même hauteur que la caméra */}
            {eclairages.length > 0 && (
              <div style={{ height: `${CARD_H}px` }} className="w-full">
                <EclairageCard 
                  bulbsData={eclairages} 
                  onUpdateAppareil={handleUpdateAppareil} 
                  className="h-full w-full" 
                />
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
               COLONNE DROITE — Grille multimédia/aspirateur + commandes basses
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 text-left">
            
            {/* ── Ligne haute : Multimédia (TV) et Aspirateur côte à côte ────
                 Hauteur = CARD_H px pour aligner avec les cartes de la colonne gauche
            ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {multimedias.length > 0 && (
                <div style={{ height: `${CARD_H}px` }} className="w-full flex">
                  <MultimediaCard multimediaData={multimedias} onUpdateAppareil={handleUpdateAppareil} className="h-full w-full" />
                </div>
              )}
              {aspirateurs.length > 0 && (
                <div style={{ height: `${CARD_H}px` }} className="w-full flex">
                  <VacuumCard vacuumData={aspirateurs} onUpdateAppareil={handleUpdateAppareil} className="h-full w-full" />
                </div>
              )}
            </div>

            {/* ── Ligne basse : Climatiseur et Rideaux empilés verticalement ──
                 Règle hauteur : LOWER_H = (CARD_H - GAP) / 2 = 253 px chacun
                   ↳ clim (253) + GAP (24) + rideaux (253) = 530 = CARD_H ✓
                   ↳ total colonne droite  = CARD_H + GAP + LOWER_H + GAP + LOWER_H
                                          = CARD_H + GAP + CARD_H = 2×CARD_H + GAP ✓
                   ↳ total colonne gauche  = CARD_H + GAP + CARD_H = 2×CARD_H + GAP ✓
                 Règle largeur : w-full sur flex-1 = même largeur que tv + aspirateur
            ── */}
            <div className="flex flex-col gap-6 w-full">
              {thermiques.length > 0 && (
                <div style={{ height: `${LOWER_H}px` }} className="w-full flex">
                  <AirConditionerCard acData={thermiques} onUpdateAppareil={handleUpdateAppareil} className="h-full w-full" />
                </div>
              )}
              {motorises.length > 0 && (
                <div style={{ height: `${LOWER_H}px` }} className="w-full flex">
                  <CurtainsCard curtainsData={motorises} onUpdateAppareil={handleUpdateAppareil} className="h-full w-full" />
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Boîte de dialogue modale pour la création d'équipements */}
      <AddAppareilModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateAppareil} formData={formData} setFormData={setFormData} />
    </div>
  );
};

export default RoomDetails;