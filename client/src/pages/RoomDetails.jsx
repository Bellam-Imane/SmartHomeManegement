import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Thermometer, Zap, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client'; 

// ── IMPORTATION DES COMPOSANTS ──
import RoomUsersCard     from '../components/RoomUsersCard';
import VoiceControlButton from '../components/VoiceControlButton';
import AirConditionerCard from '../components/AirConditionerCard';
import CameraCard         from '../components/CameraCard';
import CurtainsCard       from '../components/CurtainsCard';
import EclairageCard      from '../components/EclairageCard';
import MultimediaCard    from '../components/MultimediaCard';
import VacuumCard        from '../components/VacuumCard';
import AddAppareilModal  from '../components/AddAppareilModal';

// 🔍 FONCTION DE SÉCURITÉ
const SafeRender = ({ component: Component, props = {}, fallbackName = "Component" }) => {
  if (!Component || typeof Component !== 'function') {
    console.error(`🚨 ERREUR RUNTIME: Le composant <${fallbackName} /> n'est pas exporté correctement.`);
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-xs font-mono">
        ⚠️ Erreur d'export sur {fallbackName}Card
      </div>
    );
  }
  return <Component {...props} />;
};

const RoomDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  // --- États principaux ---
  const [pieceData, setPieceData]                 = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);

  const [liveTemperature, setLiveTemperature]     = useState(24); 
  const [liveEnergy, setLiveEnergy]               = useState(0);

  // État du formulaire d'ajout d'appareil
  const [formData, setFormData] = useState({
    nomAppareil:  '',
    typeAppareil: 'ECLAIRAGE',
    marque:       ''
  });

  // Fonction centralisée de chargement des détails
  const fetchRoomDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/pieces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = response.data?.data ?? response.data?.piece ?? response.data;

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

      if (data.appareils) {
        const totalInitial = data.appareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
        setLiveEnergy(totalInitial);
        
        const clima = data.appareils.find(app => app.typeAppareil?.toUpperCase() === 'THERMIQUE');
        if (clima && clima.temperatureActuelle) {
          setLiveTemperature(clima.temperatureActuelle);
        }
      }

    } catch (error) {
      console.error('Erreur générale lors du chargement de la pièce :', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchRoomDetails();
    }
  }, [id, fetchRoomDetails]);

  // ---------------------------------------------------------------------------
  // ⚡ CONFIGURATION DU ÉCOUTEUR REACTIONNEL SOCKET.IO (MISE À JOUR CORRECTE)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });

    console.log("🔌 [SOCKET.IO] Écouteur activé et connecté");

    socket.on('appareil_update', (data) => {
      const { deviceId, payload } = data;
      console.log("📥 [SOCKET.IO] Nouvelle mise à jour reçue :", data);

      // 1. تحديث الحرارة فوراً إذا كانت قادمة من الحساس
      if (payload.temperatureActuelle !== undefined) {
        setLiveTemperature(Number(payload.temperatureActuelle).toFixed(1));
      }

      // 2. تحديث قائمة الأجهزة وحساب مجموع الطاقة لايف دقة وحدة
      setPieceData(prevData => {
        if (!prevData || !prevData.appareils) return prevData;

        const updatedAppareils = prevData.appareils.map(app => {
          if (app._id === deviceId || app.id === deviceId) {
            return { ...app, ...payload };
          }
          return app;
        });

        // إعادة حساب مجموع الواط مباشرة من الليستة المحدثة
        const newTotalEnergy = updatedAppareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
        setLiveEnergy(newTotalEnergy);

        return { ...prevData, appareils: updatedAppareils };
      });
    });

    return () => {
      socket.off('appareil_update');
      socket.disconnect();
    };
  }, [id]); // تم التأكد من ربط التبعية بشكل صحيح

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
          
          // تحديث الواط الإجمالي بعد التحكم اليدوي أيضاً
          const newTotalEnergy = updatedAppareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
          setLiveEnergy(newTotalEnergy);
          
          return { ...prevData, appareils: updatedAppareils };
        });
      }
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'appareil :', error);
    }
  };

  const handleCreateAppareil = async (e) => {
    e.preventDefault();
    try {
      const payload  = { ...formData, piece: id };
      const token    = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/appareils',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        await fetchRoomDetails();
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

  const appareilsList = Array.isArray(pieceData?.appareils) ? pieceData.appareils : [];

  // تصنيف الأجهزة مع دعم أسماء الـ Types المختلفة (تحسين التوافق)
  const cameras     = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'CAMERA');
  const eclairages  = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'ECLAIRAGE');
  const multimedias = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MULTIMEDIA');
  const thermiques  = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'THERMIQUE');
  const motorises   = appareilsList.filter(a => a?.typeAppareil?.toUpperCase() === 'MOTORISE' || a?.typeAppareil?.toUpperCase() === 'RIDEAU');
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
          <SafeRender component={VoiceControlButton} fallbackName="VoiceControlButton" />

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
              <SafeRender 
                component={RoomUsersCard} 
                fallbackName="RoomUsersCard"
                props={{
                  utilisateurs: pieceData?.utilisateurs ?? [],
                  onAddUser: () => {},
                  onEditUser: () => {},
                  onDeleteUser: () => {}
                }}
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
              <strong className="text-sm font-extrabold text-gray-800 mt-1">{liveTemperature}°C</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
            <Zap size={18} className="text-amber-500" />
            <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
              Énergie consommée
              <strong className="text-sm font-extrabold text-gray-800 mt-1">{liveEnergy} W</strong>
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
              <SafeRender 
                component={CameraCard} 
                fallbackName="CameraCard"
                props={{
                  cameraData: cameras,
                  imageSrc: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
                  onUpdateAppareil: handleUpdateAppareil,
                  className: "h-full w-full"
                }}
              />
            </div>
          )}

          {/* 2. Éclairage */}
          {eclairages.length > 0 && (
            <div className="h-[530px] flex w-full">
              <SafeRender 
                component={EclairageCard} 
                fallbackName="EclairageCard"
                props={{
                  bulbsData: eclairages,
                  onUpdateAppareil: handleUpdateAppareil,
                  className: "h-full w-full grow"
                }}
              />
            </div>
          )}

          {/* 3. Aspirateur */}
          {aspirateurs.length > 0 && (
            <div className="h-[530px] flex w-full">
              <SafeRender 
                component={VacuumCard} 
                fallbackName="VacuumCard"
                props={{
                  vacuumData: aspirateurs,
                  onUpdateAppareil: handleUpdateAppareil,
                  className: "h-full w-full grow"
                }}
              />
            </div>
          )}

          {/* 4. Multimédia */}
          {multimedias.length > 0 && (
            <div className="h-[530px] flex w-full">
              <SafeRender 
                component={MultimediaCard} 
                fallbackName="MultimediaCard"
                props={{
                  multimediaData: multimedias,
                  onUpdateAppareil: handleUpdateAppareil,
                  className: "h-full w-full"
                }}
              />
            </div>
          )}

          {/* 5. Conteneur combiné (Climatiseur + Rideaux) */}
          {(thermiques.length > 0 || motorises.length > 0) && (
            <div className="flex flex-col justify-between gap-6 w-full md:col-span-2 lg:col-span-2 h-full min-h-[530px]">
              
              {/* Climatiseur */}
              {thermiques.length > 0 && (
                <div className="flex w-full">
                  <SafeRender 
                    component={AirConditionerCard} 
                    fallbackName="AirConditionerCard"
                    props={{
                      acData: thermiques,
                      onUpdateAppareil: handleUpdateAppareil,
                      className: "w-full"
                    }}
                  />
                </div>
              )}

              {/* Rideaux motorisés */}
              {motorises.length > 0 && (
                <div className="flex w-full">
                  <SafeRender 
                    component={CurtainsCard} 
                    fallbackName="CurtainsCard"
                    props={{
                      curtainsData: motorises,
                      onUpdateAppareil: handleUpdateAppareil,
                      className: "w-full"
                    }}
                  />
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* ── Modal d'ajout d'un nouvel appareil ── */}
      <SafeRender 
        component={AddAppareilModal} 
        fallbackName="AddAppareilModal"
        props={{
          isOpen: isModalOpen,
          onClose: () => setIsModalOpen(false),
          onSubmit: handleCreateAppareil,
          formData: formData,
          setFormData: setFormData
        }}
      />
    </div>
  );
};

export default RoomDetails;