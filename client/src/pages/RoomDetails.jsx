import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Plus, Thermometer, Zap, AlertTriangle, Loader2, Users, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client'; 

// ── IMPORTATION DES COMPOSANTS ──
import RoomUsersCard       from '../components/RoomUsersCard';
import VoiceControlButton  from '../components/VoiceControlButton';
import AirConditionerCard  from '../components/AirConditionerCard';
import CameraCard          from '../components/CameraCard';
import CurtainsCard        from '../components/CurtainsCard';
import EclairageCard       from '../components/EclairageCard';
import MultimediaCard      from '../components/MultimediaCard';
import VacuumCard          from '../components/VacuumCard';
import SecuritySensorCard  from '../components/SecuritySensorCard';
import AddAppareilModal    from '../components/AddAppareilModal';
import EditDeviceModal     from '../components/EditDeviceModal';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const RoomDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  // --- États principaux ---
  const [pieceData, setPieceData]                 = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [creatingDevice, setCreatingDevice]       = useState(false);
  const [editingDevice, setEditingDevice]          = useState(null); // device object or null
  const [savingEdit, setSavingEdit]                = useState(false);

  const [liveTemperature, setLiveTemperature]     = useState(null); // null = no THERMIQUE device
  const [liveEnergy, setLiveEnergy]               = useState(0);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Click-outside ref for users dropdown
  const dropdownRef = useRef(null);

  // État du formulaire d'ajout d'appareil
  const [formData, setFormData] = useState({
    nomAppareil:  '',
    typeAppareil: 'ECLAIRAGE',
    marque:       ''
  });

  // Click-outside handler for users dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUsersDropdown(false);
      }
    };
    if (showUsersDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUsersDropdown]);

  // Fonction centralisée de chargement des détails
  const fetchRoomDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_BASE}/api/pieces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = response.data?.data ?? response.data?.piece ?? response.data;

      // Avoid mutating the response object — create a new object
      const roomData = { ...data };

      if (roomData && Array.isArray(roomData.appareils) && roomData.appareils.length > 0) {
        if (typeof roomData.appareils[0] === 'string') {
          const requests = roomData.appareils.map(appId =>
            axios
              .get(`${API_BASE}/api/appareils/${appId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(res => res.data?.data ?? res.data)
              .catch(err => {
                console.error(`Erreur lors du chargement de l'appareil ${appId} :`, err);
                return null;
              })
          );

          const fullAppareils = await Promise.all(requests);
          roomData.appareils = fullAppareils.filter(app => app !== null);
        }
      } else if (roomData) {
        roomData.appareils = [];
      }

      setPieceData(roomData);
      setError(null);

      if (roomData.appareils) {
        const totalInitial = roomData.appareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
        setLiveEnergy(totalInitial);
        
        const clima = roomData.appareils.find(app => app.typeAppareil?.toUpperCase() === 'THERMIQUE');
        if (clima && clima.temperatureActuelle != null) {
          setLiveTemperature(clima.temperatureActuelle);
        } else {
          setLiveTemperature(null); // No THERMIQUE device
        }
      }

    } catch (error) {
      console.error('Erreur générale lors du chargement de la pièce :', error);
      setError(error.response?.data?.message || "Impossible de charger les détails de cette pièce.");
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
  // ⚡ SOCKET.IO LISTENER — guarded + filtered by room
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // Don't connect without a valid token

    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    socket.on('appareil_update', (data) => {
      const { deviceId, payload } = data;

      // Filter: only process updates for devices in THIS room
      setPieceData(prevData => {
        if (!prevData || !prevData.appareils) return prevData;

        const isThisRoom = prevData.appareils.some(
          app => app._id === deviceId || app.id === deviceId
        );
        if (!isThisRoom) return prevData;

        // Temperature update (only from this room's THERMIQUE device)
        if (payload.temperatureActuelle !== undefined) {
          setLiveTemperature(Number(payload.temperatureActuelle).toFixed(1));
        }

        const updatedAppareils = prevData.appareils.map(app => {
          if (app._id === deviceId || app.id === deviceId) {
            return { ...app, ...payload };
          }
          return app;
        });

        const newTotalEnergy = updatedAppareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
        setLiveEnergy(newTotalEnergy);

        return { ...prevData, appareils: updatedAppareils };
      });
    });

    return () => {
      socket.off('appareil_update');
      socket.disconnect();
    };
  }, [id]);

  const handleUpdateAppareil = async (appareilId, updatedAppareilData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/api/appareils/${appareilId}`,
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
          
          const newTotalEnergy = updatedAppareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
          setLiveEnergy(newTotalEnergy);
          
          return { ...prevData, appareils: updatedAppareils };
        });
      }
    } catch (error) {
      console.error('Erreur réseau lors de la mise à jour de l\'appareil :', error);
      showToast(error.response?.data?.message || "Erreur lors de la mise à jour de l'appareil.", "error");
    }
  };

  const handleCreateAppareil = async (e) => {
    e.preventDefault();
    setCreatingDevice(true);
    try {
      const payload  = { ...formData, piece: id };
      const token    = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE}/api/appareils`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        await fetchRoomDetails();
        setIsModalOpen(false);
        setFormData({ nomAppareil: '', typeAppareil: 'ECLAIRAGE', marque: '' });
        showToast(`"${formData.nomAppareil}" ajouté avec succès.`);
      }
    } catch (error) {
      console.error('Erreur réseau lors de l\'ajout de l\'appareil :', error);
      showToast(error.response?.data?.message || "Erreur lors de l'ajout de l'appareil.", "error");
    } finally {
      setCreatingDevice(false);
    }
  };

  // ── DELETE DEVICE ──
  const handleDeleteDevice = useCallback(async (deviceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE}/api/appareils/${deviceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        // Remove from local state immediately
        setPieceData(prevData => {
          if (!prevData || !prevData.appareils) return prevData;
          const updatedAppareils = prevData.appareils.filter(
            app => (app._id !== deviceId && app.id !== deviceId)
          );
          const newTotalEnergy = updatedAppareils.reduce((sum, app) => sum + (app.consommationActuelle || 0), 0);
          setLiveEnergy(newTotalEnergy);
          return { ...prevData, appareils: updatedAppareils };
        });
        showToast(response.data.message || "Appareil supprimé avec succès.");
      }
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      showToast(error.response?.data?.message || "Erreur lors de la suppression.", "error");
    }
  }, [showToast]);

  // ── OPEN EDIT MODAL ──
  const handleOpenEditDevice = useCallback((device) => {
    setEditingDevice(device);
  }, []);

  // ── SAVE EDITED DEVICE ──
  const handleSaveEditDevice = useCallback(async (deviceId, updatedData) => {
    setSavingEdit(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/api/appareils/${deviceId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const serverDevice = response.data.data;
        setPieceData(prevData => {
          if (!prevData) return prevData;
          const updatedAppareils = (prevData.appareils ?? []).map(app =>
            (app._id === deviceId || app.id === deviceId) ? serverDevice : app
          );
          return { ...prevData, appareils: updatedAppareils };
        });
        setEditingDevice(null);
        showToast("Appareil modifié avec succès.");
      }
    } catch (error) {
      console.error('Erreur lors de la modification :', error);
      showToast(error.response?.data?.message || "Erreur lors de la modification.", "error");
    } finally {
      setSavingEdit(false);
    }
  }, [showToast]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-gray-400" />
        <span className="font-semibold text-gray-500">Chargement des appareils...</span>
      </div>
    );
  }

  // ── Error State ──
  if (error && !pieceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle size={40} className="text-red-300" />
        <span className="font-semibold text-gray-600 text-center max-w-md">{error}</span>
        <button
          onClick={fetchRoomDetails}
          className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Réessayer
        </button>
        <button
          onClick={() => navigate('/home/rooms')}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Retour aux pièces
        </button>
      </div>
    );
  }

  const appareilsList = Array.isArray(pieceData?.appareils) ? pieceData.appareils : [];

  const cameras        = appareilsList.filter(a => a?.typeAppareil === 'CAMERA');
  const eclairages     = appareilsList.filter(a => a?.typeAppareil === 'ECLAIRAGE');
  const multimedias    = appareilsList.filter(a => a?.typeAppareil === 'MULTIMEDIA');
  const thermiques     = appareilsList.filter(a => a?.typeAppareil === 'THERMIQUE');
  const motorises      = appareilsList.filter(a => a?.typeAppareil === 'MOTORISE');
  const aspirateurs    = appareilsList.filter(a => a?.typeAppareil === 'ASPIRATEUR');
  const securityDevices = appareilsList.filter(a =>
    a?.typeAppareil === 'SECURITE' || a?.typeAppareil === 'PORTE' || a?.typeAppareil === 'CAPTEUR'
  );

  const utilisateurs = pieceData?.utilisateurs ?? [];

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-6 font-sans select-none relative">

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

          {/* Users dropdown */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setShowUsersDropdown(prev => !prev)}
              className="flex items-center gap-3 bg-white pl-4 pr-3 py-2 rounded-full shadow-xs border border-gray-100 cursor-pointer hover:bg-gray-50 transition-all select-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Users size={16} className="text-gray-500" />
              </div>
              <span className="text-sm font-bold text-gray-700">
                {utilisateurs.length > 0 ? `${utilisateurs.length} membre${utilisateurs.length > 1 ? 's' : ''}` : 'Membres'}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showUsersDropdown ? 'rotate-180' : ''}`} />
            </div>

            {showUsersDropdown && (
              <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 p-4">
                {utilisateurs.length > 0 ? (
                  <RoomUsersCard 
                    utilisateurs={utilisateurs}
                    onAddUser={() => showToast("Fonctionnalité à venir.", "info")}
                    onEditUser={() => showToast("Fonctionnalité à venir.", "info")}
                    onDeleteUser={() => showToast("Fonctionnalité à venir.", "info")}
                  />
                ) : (
                  <div className="text-center py-6">
                    <Users size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">Aucun membre assigné</p>
                    <p className="text-xs text-gray-300 mt-1">Les membres apparaîtront ici</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Error banner (partial error — data still shows) ── */}
      {error && pieceData && (
        <div className="w-full max-w-[1340px] mx-auto mb-4 flex items-center gap-3 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="text-sm font-medium flex-1">{error}</span>
          <button onClick={fetchRoomDetails} className="text-xs font-semibold underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* ── Widgets de synthèse ── */}
      <section className="flex justify-between items-center w-full max-w-[1340px] mx-auto mb-8">
        <div className="flex items-center gap-4">
          {liveTemperature !== null && (
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xs border border-gray-100">
              <Thermometer size={18} className="text-orange-500" />
              <span className="text-xs font-bold text-gray-400 flex flex-col items-start leading-none">
                Température intérieure
                <strong className="text-sm font-extrabold text-gray-800 mt-1">{liveTemperature}°C</strong>
              </span>
            </div>
          )}

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
        {appareilsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Zap size={24} className="text-gray-400" />
            </div>
            <span className="font-semibold text-gray-400">Aucun appareil dans cette pièce.</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              <Plus size={16} />
              Ajouter un appareil
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-dense gap-6 auto-rows-auto items-stretch justify-center w-full text-left">

            {/* 1. Caméra */}
            {cameras.length > 0 && (
              <div className="h-[530px] flex w-full">
                <CameraCard 
                  cameraData={cameras}
                  imageSrc="https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
                  onUpdateAppareil={handleUpdateAppareil}
                  onEditDevice={handleOpenEditDevice}
                  onDeleteDevice={handleDeleteDevice}
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
                  onEditDevice={handleOpenEditDevice}
                  onDeleteDevice={handleDeleteDevice}
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
                  onEditDevice={handleOpenEditDevice}
                  onDeleteDevice={handleDeleteDevice}
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
                  onEditDevice={handleOpenEditDevice}
                  onDeleteDevice={handleDeleteDevice}
                  className="h-full w-full"
                />
              </div>
            )}

            {/* 5. Conteneur combiné (Climatiseur + Rideaux) */}
            {(thermiques.length > 0 || motorises.length > 0) && (
              <div className="flex flex-col justify-between gap-6 w-full md:col-span-2 lg:col-span-2 h-full min-h-[530px]">
                
                {thermiques.length > 0 && (
                  <div className="flex w-full">
                    <AirConditionerCard 
                      acData={thermiques}
                      onUpdateAppareil={handleUpdateAppareil}
                      onEditDevice={handleOpenEditDevice}
                      onDeleteDevice={handleDeleteDevice}
                      className="w-full"
                    />
                  </div>
                )}

                {motorises.length > 0 && (
                  <div className="flex w-full">
                    <CurtainsCard 
                      curtainsData={motorises}
                      onUpdateAppareil={handleUpdateAppareil}
                      onEditDevice={handleOpenEditDevice}
                      onDeleteDevice={handleDeleteDevice}
                      className="w-full"
                    />
                  </div>
                )}

              </div>
            )}

            {/* 6. Sécurité, Portes & Capteurs */}
            {securityDevices.length > 0 && (
              <div className="w-full md:col-span-2 lg:col-span-3">
                <SecuritySensorCard 
                  devices={securityDevices}
                  onUpdateAppareil={handleUpdateAppareil}
                  onEditDevice={handleOpenEditDevice}
                  onDeleteDevice={handleDeleteDevice}
                  className="w-full"
                />
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── Modal d'ajout d'un nouvel appareil ── */}
      <AddAppareilModal 
        isOpen={isModalOpen}
        onClose={() => { if (!creatingDevice) setIsModalOpen(false); }}
        onSubmit={handleCreateAppareil}
        formData={formData}
        setFormData={setFormData}
        isLoading={creatingDevice}
      />

      {/* ── Modal de modification d'un appareil ── */}
      <EditDeviceModal
        isOpen={!!editingDevice}
        device={editingDevice}
        onClose={() => { if (!savingEdit) setEditingDevice(null); }}
        onSave={handleSaveEditDevice}
        isLoading={savingEdit}
      />
    </div>
  );
};

export default RoomDetails;
