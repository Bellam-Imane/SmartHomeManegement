import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Plus, Moon, Sun, Home, Film, Utensils } from 'lucide-react'; 
import { Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity, X, Loader2 } from 'lucide-react';
import RuleCard from '../components/RuleCard';
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';
import AIRecommendationCard from '../components/AIRecommendationCard';

const { translations } = require("../translations");

const API_BASE = 'http://localhost:5000';

// Protection des traductions en cas de problème de chargement externe
const localTranslations = {
  "Français": { automation: "Automatisation" },
  "English": { automation: "Automation" },
  "العربية": { automation: "الأتمتة" }
};

// Liste des commandes disponibles par type d'appareil (statique, hors du composant)
const COMMANDES_PAR_TYPE = {
  'ECLAIRAGE': ['ON', 'OFF', 'INTENSITE_50', 'INTENSITE_100', 'COULEUR_ROUGE', 'COULEUR_BLEU'],
  'THERMIQUE': ['ON', 'OFF', 'MODE_CHAUD', 'MODE_FROID', 'MODE_AUTO'],
  'MULTIMEDIA': ['ON', 'OFF', 'PLAY', 'PAUSE', 'VOLUME_UP', 'VOLUME_DOWN', 'APP_NETFLIX', 'APP_YOUTUBE'],
  'MOTORISE': ['OPEN', 'CLOSE', 'STOP'],
  'ASPIRATEUR': ['START', 'STOP', 'DOCK', 'MODE_TURBO', 'MODE_SILENCIEUX'],
  'SECURITE': ['ACTIVER_ALARME', 'DESACTIVER_ALARME'],
  'CAMERA': ['START_RECORD', 'STOP_RECORD'],
  'PORTE': ['LOCK', 'UNLOCK'],
  'CAPTEUR': ['ACTIVER_DETECTION', 'DESACTIVER_DETECTION']
};

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Mapping complet type d'appareil → icône pour les règles
const RULE_ICON_MAP = {
  THERMIQUE: Thermometer,
  ECLAIRAGE: Lightbulb,
  MULTIMEDIA: Radio,
  MOTORISE: Wind,
  ASPIRATEUR: Activity,
  SECURITE: ShieldAlert,
  CAMERA: ShieldAlert,
  PORTE: ShieldAlert,
  CAPTEUR: Leaf
};

// Mapping icône de scène (statique, hors du composant)
const SCENE_ICON_MAP = { Moon, Sun, Home, Film, Utensils, Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity };

const Automation = () => {
  // --- ÉTATS GLOBAUX (STATES) ---
  const [language, setLanguage] = useState("Français");

  const [dbRules, setDbRules] = useState([]);
  const [dbScenes, setDbScenes] = useState([]);
  const [allAppareils, setAllAppareils] = useState([]);
  const [piecesDeLaDb, setPiecesDeLaDb] = useState([]); 

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [toast, setToast] = useState(null);

  // Inline toast helper (auto-dismiss after 3s)
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // États pour contrôler l'ouverture des Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  
  // États de filtrage des appareils par pièce
  const [selectedPieceScene, setSelectedPieceScene] = useState('');
  const [selectedPieceRule, setSelectedPieceRule] = useState('');

  // Choix du type d'automatisation : 'EVENT' (Capteur) ou 'PLANIF' (Temps)
  const [ruleType, setRuleType] = useState('EVENT'); 

  // Structure d'une nouvelle règle (Fusionnée avec le modèle Planification)
  const [newRule, setNewRule] = useState({
    nomRegle: '',
    priorite: 1,
    condition: { typeAppareil: 'ECLAIRAGE', valeurSeuil: '', operateur: '==' },
    action: { appareilCible: '', commande: 'ON' },
    isPlanif: false,
    heureDebut: '',
    heureFin: '',
    jourRepetition: []
  });

  // Structure d'une nouvelle scène
  const [newScene, setNewScene] = useState({
    nomScene: '',
    description: '',
    icone: 'Moon',
    actions: []
  });

  // Action temporaire avant l'ajout final à la scène
  const [currentAction, setCurrentAction] = useState({ appareilId: '', commande: '' });

  const t = localTranslations[language] || localTranslations["Français"];

  // --- EFFECT : Gestion du changement de langue via localStorage ---
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- Helper: build auth headers ---
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  // --- Chargement des appareils ---
  const fetchAppareils = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/appareils`, { headers: getHeaders() });
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setAllAppareils(data);

      if (data.length > 0) {
        const first = data[0];
        const firstType = first.typeAppareil?.toUpperCase();
        setCurrentAction({
          appareilId: first._id || first.id,
          commande: COMMANDES_PAR_TYPE[firstType]?.[0] || 'ON'
        });
        setNewRule(prev => ({
          ...prev,
          action: { ...prev.action, appareilCible: first._id || first.id }
        }));
      }
      return data;
    } catch (err) {
      console.error("[Automation] Error fetching appareils:", err.message);
      throw err;
    }
  }, [getHeaders]);

  // --- Chargement des scènes ---
  const fetchScenes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/scenes`, { headers: getHeaders() });
      setDbScenes(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error("[Automation] Error fetching scenes:", err.message);
      throw err;
    }
  }, [getHeaders]);

  // --- Chargement des règles ---
  const fetchRules = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/rules`, { headers: getHeaders() });
      setDbRules(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error("[Automation] Error fetching rules:", err.message);
      throw err;
    }
  }, [getHeaders]);

  // --- EFFECT : Chargement initial des données depuis le Backend ---
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        // 1. Récupération des pièces
        const piecesRes = await axios.get(`${API_BASE}/api/pieces/all`, { headers: getHeaders() });
        if (!cancelled && piecesRes.data?.success) {
          const rawPieces = piecesRes.data?.data?.pieces ?? piecesRes.data?.pieces ?? [];
          setPiecesDeLaDb(Array.isArray(rawPieces) ? rawPieces : []);
        }

        // 2. Charger appareils, scènes et règles en parallèle
        await Promise.all([fetchAppareils(), fetchScenes(), fetchRules()]);
      } catch (err) {
        if (!cancelled) {
          setFetchError("Erreur lors du chargement des données. Veuillez rafraîchir la page.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [fetchAppareils, fetchScenes, fetchRules, getHeaders]);

  // --- Socket.IO : Real-time updates for appareils ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    socket.on('appareil_update', (data) => {
      const { deviceId, payload } = data;
      setAllAppareils(prev =>
        prev.map(a => a._id === deviceId ? { ...a, ...payload } : a)
      );
    });

    return () => { socket.disconnect(); };
  }, []);

  // --- FILTRAGE DES APPAREILS EN TEMPS RÉEL PAR PIÈCE (memoized to prevent useEffect infinite loops) ---
  const appareilsFiltresScene = useMemo(() => 
    selectedPieceScene
      ? allAppareils.filter(a => (a.piece?._id === selectedPieceScene || a.piece?.nomPiece === selectedPieceScene || a.piece === selectedPieceScene))
      : allAppareils,
    [selectedPieceScene, allAppareils]
  );

  const appareilsFiltresRule = useMemo(() => 
    selectedPieceRule
      ? allAppareils.filter(a => (a.piece?._id === selectedPieceRule || a.piece?.nomPiece === selectedPieceRule || a.piece === selectedPieceRule))
      : allAppareils,
    [selectedPieceRule, allAppareils]
  );

  // Auto-sélection de l'appareil après filtrage dans la scène
  useEffect(() => {
    if (appareilsFiltresScene.length > 0) {
      const first = appareilsFiltresScene[0];
      const firstType = first.typeAppareil?.toUpperCase();
      setCurrentAction({
        appareilId: first._id || first.id,
        commande: COMMANDES_PAR_TYPE[firstType]?.[0] || 'ON'
      });
    }
  }, [appareilsFiltresScene]);

  // Auto-sélection de l'appareil après filtrage dans la règle
  useEffect(() => {
    if (appareilsFiltresRule.length > 0) {
      const first = appareilsFiltresRule[0];
      const firstType = first.typeAppareil?.toUpperCase();
      setNewRule(prev => ({
        ...prev,
        action: { appareilCible: first._id || first.id, commande: COMMANDES_PAR_TYPE[firstType]?.[0] || 'ON' }
      }));
    } else {
      setNewRule(prev => ({ ...prev, action: { ...prev.action, appareilCible: '' } }));
    }
  }, [appareilsFiltresRule]);

  // Commandes dynamiques pour l'appareil sélectionné dans la scène
  const selectedAppareilScene = allAppareils.find(a => (a._id === currentAction.appareilId || a.id === currentAction.appareilId));
  const sceneCommandes = selectedAppareilScene
    ? (COMMANDES_PAR_TYPE[selectedAppareilScene.typeAppareil?.toUpperCase()] || ['ON', 'OFF'])
    : ['ON', 'OFF'];

  // Commandes dynamiques pour l'appareil sélectionné dans la règle
  const selectedAppareilRule = allAppareils.find(a => (a._id === newRule.action.appareilCible || a.id === newRule.action.appareilCible));
  const ruleCommandes = selectedAppareilRule
    ? (COMMANDES_PAR_TYPE[selectedAppareilRule.typeAppareil?.toUpperCase()] || ['ON', 'OFF'])
    : ['ON', 'OFF'];

  const allRecommendations = [
    { id: 1, text: language === "العربية" ? "استهلاكك للطاقة مرتفع في المطبخ حالياً." : "Votre consommation est élevée dans la cuisine." }
  ];

  // ── SCENES : Uniquement depuis MongoDB, triées par date de création (plus récent d'abord) ──
  const displayScenes = useMemo(() => [...dbScenes]
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    .map(scene => ({
      _id: scene._id,
      title: scene.nomScene,
      desc: scene.description,
      icon: SCENE_ICON_MAP[scene.icone] || Home,
      isActiveByDefault: scene.estActif || false
    })), [dbScenes]);

  // ── RULES : Uniquement depuis MongoDB, triées par date de création (plus récent d'abord) ──
  const displayRules = useMemo(() => [...dbRules]
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    .map(rule => {
      const appObj = allAppareils.find(a => (a._id === rule.action?.appareilCible || a.id === rule.action?.appareilCible));
      const isActive = rule.isPlanif ? (rule.estActive !== false) : (rule.etat !== false);

      if (rule.isPlanif) {
        return {
          _id: rule._id,
          title: rule.nomRegle,
          icon: Activity,
          time: `⏱️ À ${rule.heureDebut || '?'} [${rule.jourRepetition?.join(', ') || 'Tous les jours'}]`,
          action: `Action: ${appObj ? appObj.nomAppareil : 'Appareil'} ➡️ ${rule.action?.commande || ''}`,
          isActive
        };
      }
      // Utiliser le mapping complet d'icônes basé sur le type d'appareil
      const RuleIcon = RULE_ICON_MAP[rule.condition?.typeAppareil?.toUpperCase()] || Lightbulb;
      return {
        _id: rule._id,
        title: rule.nomRegle,
        icon: RuleIcon,
        time: `${rule.condition?.typeAppareil || ''} ${rule.condition?.operateur || ''} ${rule.condition?.valeurSeuil || ''}`,
        action: `Action: ${appObj ? appObj.nomAppareil : 'Appareil'} ➡️ ${rule.action?.commande || ''}`,
        isActive
      };
    }), [dbRules, allAppareils]);

  // Gestion de la pagination des recommandations IA
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const handleNextRec = () => setCurrentRecIndex(prev => prev === allRecommendations.length - 1 ? 0 : prev + 1);
  const handlePrevRec = () => setCurrentRecIndex(prev => prev === 0 ? allRecommendations.length - 1 : prev - 1);

  // Gestion de la sélection/désélection des jours de répétition
  const toggleJour = (jour) => {
    setNewRule(prev => ({
      ...prev,
      jourRepetition: prev.jourRepetition.includes(jour)
        ? prev.jourRepetition.filter(j => j !== jour)
        : [...prev.jourRepetition, jour]
    }));
  };

  // Suppression d'une action de la scène en cours de création
  const removeSceneAction = (index) => {
    setNewScene(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  // --- Callbacks pour les cartes ---
  const handleDeleteRule = (ruleId) => {
    setDbRules(prev => prev.filter(r => r._id !== ruleId));
  };

  const handleToggleRule = (ruleId, newState) => {
    setDbRules(prev => prev.map(r => r._id === ruleId ? { ...r, etat: newState, estActive: newState } : r));
  };

  const handleDeleteScene = (sceneId) => {
    setDbScenes(prev => prev.filter(s => s._id !== sceneId));
  };

  const handleExecuteScene = (sceneId, executedCount) => {
    setDbScenes(prev => prev.map(s => s._id === sceneId ? { ...s, estActif: true } : s));
  };

  // --- SUBMIT : Enregistrement d'une règle ou d'une planification ---
  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.action.appareilCible) {
      showToast(language === "العربية" ? "الرجاء اختيار جهاز صالح" : "Veuillez sélectionner un appareil cible valide.");
      return;
    }

    // Construire le payload : omettre condition pour PLANIF (pas de données résiduelles)
    const payload = {
      nomRegle: newRule.nomRegle,
      priorite: newRule.priorite,
      action: newRule.action,
      isPlanif: ruleType === 'PLANIF',
      heureDebut: newRule.heureDebut,
      heureFin: newRule.heureFin,
      jourRepetition: newRule.jourRepetition
    };

    // Ajouter condition uniquement pour les règles EVENT
    if (ruleType === 'EVENT') {
      payload.condition = newRule.condition;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/rules`, payload, { headers: getHeaders() });
      setDbRules(prev => [...prev, res.data]);
      setIsRuleModalOpen(false);
      setSelectedPieceRule('');
      setRuleType('EVENT');
      const firstId = allAppareils[0]?._id || allAppareils[0]?.id || '';
      setNewRule({
        nomRegle: '', priorite: 1,
        condition: { typeAppareil: 'ECLAIRAGE', valeurSeuil: '', operateur: '==' },
        action: { appareilCible: firstId, commande: firstId ? (COMMANDES_PAR_TYPE[allAppareils[0]?.typeAppareil?.toUpperCase()]?.[0] || 'ON') : 'ON' },
        isPlanif: false, heureDebut: '', heureFin: '', jourRepetition: []
      });
    } catch (err) {
      console.error("Error saving rule:", err);
      showToast(language === "العربية" ? "خطأ أثناء حفظ القاعدة" : "Erreur lors de l'enregistrement de la règle.");
    }
  };

  // --- SUBMIT : Enregistrement d'une scène ---
  const handleAddScene = async (e) => {
    e.preventDefault();
    if (newScene.actions.length === 0) {
      showToast(language === "العربية" ? "الرجاء إضافة إجراء واحد على الأقل" : "Veuillez ajouter au moins une action à la scène.");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/scenes`, newScene, { headers: getHeaders() });
      setDbScenes(prev => [...prev, res.data]);
      setIsSceneModalOpen(false);
      setNewScene({ nomScene: '', description: '', icone: 'Moon', actions: [] });
      setSelectedPieceScene(''); 
    } catch (err) {
      console.error("Error saving scene:", err);
      showToast(language === "العربية" ? "خطأ أثناء حفظ المشهد" : "Erreur lors de l'enregistrement de la scène.");
    }
  };

  // --- Loading overlay ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-gray-500" />
          <p className="text-gray-500 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8 bg-[#f8f9fa]" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* Inline Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <ShieldAlert size={18} />
          {fetchError}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t.automation || "Automatisation"}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {language === "العربية" ? "قم بتهيئة وإعداد مشاهدك الذكية." : "Configure vos scènes intelligentes."}
          </p>
        </div>
        <VoiceControlButton />
      </header>

      {/* Boutons Ajouter */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button onClick={() => setIsSceneModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
          <Plus size={18} />
          {language === "العربية" ? "إضافة مشهد" : "Ajouter une scène"}
        </button>
        <button onClick={() => setIsRuleModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
          <Plus size={18} />
          {language === "العربية" ? "إضافة قاعدة" : "Ajouter une règle"}
        </button>
      </div>

      {/* MODAL SCÈNE */}
      {isSceneModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <form onSubmit={handleAddScene} className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="text-lg font-bold text-gray-800">Créer une Scène Personnalisée</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Nom de la scène</label>
              <input type="text" required className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" onChange={e => setNewScene({...newScene, nomScene: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Description</label>
              <textarea required className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" rows="2" onChange={e => setNewScene({...newScene, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Icône illustrative</label>
              <select className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" onChange={e => setNewScene({...newScene, icone: e.target.value})}>
                <option value="Moon">Mode Nuit (Lune)</option>
                <option value="Sun">Routine Matin (Soleil)</option>
                <option value="Home">Mode Absence (Maison)</option>
                <option value="Film">Mode Cinéma (Film)</option>
                <option value="Utensils">Mode Cuisine (Ustensiles)</option>
              </select>
            </div>
            {/* Actions de la scène avec commandes dynamiques */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase block">Configurer les Actions</span>
              <select className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none" value={selectedPieceScene} onChange={e => setSelectedPieceScene(e.target.value)}>
                <option value="">Toutes les pièces</option>
                {piecesDeLaDb.map(p => <option key={p._id || p} value={p._id || p.nomPiece || p}>{p.nomPiece || p}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs" value={currentAction.appareilId} onChange={e => {
                  const appId = e.target.value;
                  const app = allAppareils.find(a => a._id === appId || a.id === appId);
                  const cmds = app ? (COMMANDES_PAR_TYPE[app.typeAppareil?.toUpperCase()] || ['ON', 'OFF']) : ['ON', 'OFF'];
                  setCurrentAction({ appareilId: appId, commande: cmds[0] });
                }}>
                  {appareilsFiltresScene.map(app => <option key={app._id || app.id} value={app._id || app.id}>{app.nomAppareil}</option>)}
                </select>
                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs" value={currentAction.commande} onChange={e => setCurrentAction({...currentAction, commande: e.target.value})}>
                  {sceneCommandes.map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => setNewScene({...newScene, actions: [...newScene.actions, currentAction]})} className="w-full py-2 bg-slate-200 text-gray-800 rounded-xl text-xs font-bold">+ Ajouter cette action</button>
              {newScene.actions.length > 0 && (
                <div className="text-[10px] text-gray-500 space-y-1">
                  {newScene.actions.map((a, i) => {
                    const app = allAppareils.find(x => x._id === a.appareilId || x.id === a.appareilId);
                    return (
                      <div key={i} className="flex justify-between items-center bg-white p-1.5 rounded-lg">
                        <span>{app?.nomAppareil || 'Appareil'}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{a.commande}</span>
                          <button type="button" onClick={() => removeSceneAction(i)} className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 text-sm font-bold border-t">
              <button type="button" onClick={() => setIsSceneModalOpen(false)} className="px-4 py-2 text-gray-400">Annuler</button>
              <button type="submit" className="px-5 py-2 bg-[#1e293b] text-white rounded-xl">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL RÈGLE ET PLANIFICATION */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <form onSubmit={handleAddRule} className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3 className="text-lg font-bold text-gray-800">Nouvelle Règle Intelligente</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Nom de la règle</label>
              <input type="text" required className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" onChange={e => setNewRule({...newRule, nomRegle: e.target.value})} />
            </div>

            {/* Commutateur de Type : Condition (Event) ou Planification (Temps) */}
            <div className="flex gap-4 items-center py-1">
              <label className="flex items-center gap-1 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="radio" name="typeR" checked={ruleType === 'EVENT'} onChange={() => setRuleType('EVENT')} />
                Condition Appareil
              </label>
              <label className="flex items-center gap-1 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="radio" name="typeR" checked={ruleType === 'PLANIF'} onChange={() => setRuleType('PLANIF')} />
                Planification (Temps)
              </label>
            </div>
            
            {/* 1. Bloc Condition Event (Capteurs) */}
            {ruleType === 'EVENT' && (
              <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Si (Condition)</span>
                <div className="grid grid-cols-3 gap-2">
                  <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, typeAppareil: e.target.value}})}>
                    <option value="THERMIQUE">THERMIQUE</option>
                    <option value="CAPTEUR">CAPTEUR</option>
                    <option value="ECLAIRAGE">ECLAIRAGE</option>
                  </select>
                  <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, operateur: e.target.value}})}>
                    <option value="==">==</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="!=">!=</option>
                  </select>
                  <input type="text" required placeholder="Seuil" className="p-2 bg-white border border-gray-200 rounded-lg text-xs w-full" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, valeurSeuil: e.target.value}})} />
                </div>
              </div>
            )}

            {/* 2. Bloc Planification Horaire (Heure Début / Heure Fin) */}
            {ruleType === 'PLANIF' && (
              <div className="bg-gray-50 p-3 rounded-xl space-y-3 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Planification Horaire</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Heure de Début</label>
                    <input type="time" required={ruleType === 'PLANIF'} className="w-full p-2 bg-white border rounded-lg text-xs" onChange={e => setNewRule({...newRule, heureDebut: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Heure de Fin (Optionnel)</label>
                    <input type="time" className="w-full p-2 bg-white border rounded-lg text-xs" onChange={e => setNewRule({...newRule, heureFin: e.target.value})} />
                  </div>
                </div>
                {/* Sélecteur de jours pour répétition */}
                <div className="flex flex-wrap gap-1">
                  {JOURS_SEMAINE.map(j => (
                    <button type="button" key={j} onClick={() => toggleJour(j)} className={`px-2 py-1 text-[10px] border rounded ${newRule.jourRepetition.includes(j) ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
                      {j.substring(0,3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bloc Action avec commandes dynamiques */}
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Alors (Action)</span>
              
              <div className="mb-2">
                <select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none" value={selectedPieceRule} onChange={e => setSelectedPieceRule(e.target.value)}>
                  <option value="">Toutes les pièces</option>
                  {piecesDeLaDb.map(p => <option key={p._id || p} value={p._id || p.nomPiece || p}>{p.nomPiece || p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" value={newRule.action.appareilCible} onChange={e => {
                  const appId = e.target.value;
                  const app = allAppareils.find(a => a._id === appId || a.id === appId);
                  const cmds = app ? (COMMANDES_PAR_TYPE[app.typeAppareil?.toUpperCase()] || ['ON', 'OFF']) : ['ON', 'OFF'];
                  setNewRule({...newRule, action: { appareilCible: appId, commande: cmds[0] }});
                }}>
                  {appareilsFiltresRule.map(app => <option key={app._id || app.id} value={app._id || app.id}>{app.nomAppareil}</option>)}
                </select>
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" value={newRule.action.commande} onChange={e => setNewRule({...newRule, action: {...newRule.action, commande: e.target.value}})}>
                  {ruleCommandes.map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-sm font-bold">
              <button type="button" onClick={() => { setIsRuleModalOpen(false); setSelectedPieceRule(''); }} className="px-4 py-2 text-gray-400">Annuler</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* ── SCENES : Uniquement depuis MongoDB ── */}
      <section className="flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">{language === "العربية" ? "المشاهد" : "Les Scènes"}</h2>
        {displayScenes.length === 0 ? (
          <p className="text-gray-400 text-sm px-2">
            {language === "العربية" ? "لا توجد مشاهد. أضف واحداً!" : "Aucune scène. Ajoutez-en une !"}
          </p>
        ) : (
          <div className="w-full overflow-x-auto scrollbar-hide pb-6">
            <div className="flex gap-6 w-max pr-10"> 
              {displayScenes.map((scene) => (
                <SceneCard
                  key={scene._id}
                  {...scene}
                  sceneId={scene._id}
                  onDelete={handleDeleteScene}
                  onExecute={handleExecuteScene}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
        {/* ── RULES : Uniquement depuis MongoDB ── */}
        <section className="flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">{language === "العربية" ? "القواعد الذكية" : "Les Règles Intelligentes"}</h2>
          {displayRules.length === 0 ? (
            <p className="text-gray-400 text-sm px-2">
              {language === "العربية" ? "لا توجد قواعد. أضف واحدة!" : "Aucune règle. Ajoutez-en une !"}
            </p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {displayRules.map((rule) => (
                <RuleCard
                  key={rule._id}
                  {...rule}
                  ruleId={rule._id}
                  onDelete={handleDeleteRule}
                  onToggle={handleToggleRule}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col">
          <AIRecommendationCard recommendation={allRecommendations[currentRecIndex]} onNext={handleNextRec} onPrev={handlePrevRec} />
        </section>
      </div>
    </div>
  );
};

export default Automation;
