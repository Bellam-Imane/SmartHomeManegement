import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Plus, Moon, Sun, Home, Film, Utensils, Trash2 } from 'lucide-react'; 
import { Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity } from 'lucide-react';
import RuleCard from '../components/RuleCard';
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';
import AIRecommendationCard from '../components/AIRecommendationCard';

// Protection des traductions en cas de problème de chargement externe
const localTranslations = {
  "Français": { automation: "Automatisation" },
  "English": { automation: "Automation" },
  "العربية": { automation: "الأتمتة" }
};

const Automation = () => {
  // --- ÉTATS GLOBAUX (STATES) ---
  const [language, setLanguage] = useState("Français");

  const [dbRules, setDbRules] = useState([]);
  const [dbScenes, setDbScenes] = useState([]);
  const [allAppareils, setAllAppareils] = useState([]);
  const [piecesDeLaDb, setPiecesDeLaDb] = useState([]); 

  // États pour contrôler l'ouverture des Modals
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  
  // États de filtrage des appareils par pièce
  const [selectedPieceScene, setSelectedPieceScene] = useState('');
  const [selectedPieceRule, setSelectedPieceRule] = useState('');

  // Choix du type d'automatisation : 'EVENT' (Capteur) ou 'PLANIF' (Temps)
  const [ruleType, setRuleType] = useState('EVENT'); 

  // Liste des commandes disponibles par type d'appareil
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

  // Structure d'une nouvelle règle (Fusionnée avec le modèle Planification)
  const [newRule, setNewRule] = useState({
    nomRegle: '',
    priorite: 1,
    condition: { typeAppareil: 'ECLAIRAGE', valeurSeuil: '', operateur: '==' },
    action: { appareilCible: '', commande: 'ON' },
    isPlanif: false,
    heureDebut: '', // Heure de début de la planification
    heureFin: '',   // Heure de fin de la planification
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

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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

  // --- EFFECT : Chargement initial des données depuis le Backend ---
  useEffect(() => {
    const token = localStorage.getItem('token'); 
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 1. Récupération des pièces
    axios.get('http://localhost:5000/api/pieces/all', { headers })
    .then(res => {
      if (res.data?.success) {
        const rawPieces = res.data?.data?.pieces ?? res.data?.pieces ?? [];
        setPiecesDeLaDb(Array.isArray(rawPieces) ? rawPieces : []);
      }
    }).catch(err => console.error("Error pieces:", err));

    // 2. Récupération des appareils
    axios.get('http://localhost:5000/api/appareils', { headers })
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setAllAppareils(data);

      if (data.length > 0) {
        const first = data[0];
        setCurrentAction({
          appareilId: first._id || first.id,
          commande: COMMANDES_PAR_TYPE[first.typeAppareil?.toUpperCase()]?.[0] || 'ON'
        });
        setNewRule(prev => ({
          ...prev,
          action: { ...prev.action, appareilCible: first._id || first.id }
        }));
      }
    }).catch(err => console.error("Error devices:", err));

    // 3. Récupération des scènes
    axios.get('http://localhost:5000/api/scenes', { headers })
    .then(res => setDbScenes(Array.isArray(res.data) ? res.data : (res.data.data || [])))
    .catch(err => console.error("Error scenes:", err));

    // 4. Récupération des règles
    axios.get('http://localhost:5000/api/rules', { headers })
    .then(res => setDbRules(Array.isArray(res.data) ? res.data : (res.data.data || [])))
    .catch(err => console.error("Error rules:", err));
  }, []);

  // --- FILTRAGE DES APPAREILS EN TEMPS RÉEL PAR PIÈCE ---
  const appareilsFiltresScene = selectedPieceScene
    ? allAppareils.filter(a => (a.piece?._id === selectedPieceScene || a.piece?.nomPiece === selectedPieceScene || a.piece === selectedPieceScene))
    : allAppareils;

  const appareilsFiltresRule = selectedPieceRule
    ? allAppareils.filter(a => (a.piece?._id === selectedPieceRule || a.piece?.nomPiece === selectedPieceRule || a.piece === selectedPieceRule))
    : allAppareils;

  // Auto-sélection de l'appareil après filtrage dans la scène
  useEffect(() => {
    if (appareilsFiltresScene.length > 0) {
      const first = appareilsFiltresScene[0];
      setCurrentAction({
        appareilId: first._id || first.id,
        commande: COMMANDES_PAR_TYPE[first.typeAppareil?.toUpperCase()]?.[0] || 'ON'
      });
    }
  }, [selectedPieceScene, allAppareils]);

  // Auto-sélection de l'appareil après filtrage dans la règle
  useEffect(() => {
    if (appareilsFiltresRule.length > 0) {
      const first = appareilsFiltresRule[0];
      setNewRule(prev => ({
        ...prev,
        action: { appareilCible: first._id || first.id, commande: COMMANDES_PAR_TYPE[first.typeAppareil?.toUpperCase()]?.[0] || 'ON' }
      }));
    } else {
      setNewRule(prev => ({ ...prev, action: { ...prev.action, appareilCible: '' } }));
    }
  }, [selectedPieceRule, allAppareils]);

  // Données statiques de démonstration pour l'UI
  const scenes = [
    { title: language === "العربية" ? "الوضع الليلي" : "Mode Nuit", icon: Moon, desc: "..." },
    { title: language === "العربية" ? "الروتين الصباحي" : "Routine Matin", icon: Sun, desc: "..." },
    { title: language === "العربية" ? "وضع الغياب" : "Mode Absence", icon: Home, desc: "..." },
    { title: language === "العربية" ? "وضع السينما" : "Mode Cinéma", icon: Film, desc: "..." },
    { title: language === "العربية" ? "وضع المطبخ" : "Mode Cuisine", icon: Utensils, desc: "..." }
  ];

  const rules = [
    { title: "Détection Mouvement", icon: ShieldAlert, time: "Condition: CAPTEUR == 1", action: "Action: Alarme ➡️ ACTIVER" }
  ];

  const allRecommendations = [
    { id: 1, text: language === "العربية" ? "استهلاكك للطاقة مرتفع في المطبخ حالياً." : "Votre consommation est élevée dans la cuisine." }
  ];

  const iconMap = { Moon, Sun, Home, Film, Utensils, Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity };

  // Combinaison des données statiques et dynamiques
  const combinedScenes = [...scenes, ...dbScenes.map(scene => ({ title: scene.nomScene, desc: scene.description, icon: iconMap[scene.icone] || Home }))];

  const combinedRules = [
    ...rules,
    ...dbRules.map(rule => {
      const appObj = allAppareils.find(a => (a._id === rule.action?.appareilCible || a.id === rule.action?.appareilCible));
      // Formatage d'affichage si c'est une planification (Temps)
      if (rule.isPlanif) {
        return {
          title: rule.nomRegle,
          icon: Activity,
          time: `⏱️ À ${rule.heureDebut} [${rule.jourRepetition?.join(', ')}]`,
          action: `Action: ${appObj ? appObj.nomAppareil : 'Appareil'} ➡️ ${rule.action?.commande || ''}`
        };
      }
      // Formatage d'affichage si c'est une règle basée sur un capteur
      return {
        title: rule.nomRegle,
        icon: iconMap[rule.condition?.typeAppareil === 'THERMIQUE' ? 'Thermometer' : 'Lightbulb'] || Activity,
        time: `${rule.condition?.typeAppareil || ''} ${rule.condition?.operateur || ''} ${rule.condition?.valeurSeuil || ''}`,
        action: `Action: ${appObj ? appObj.nomAppareil : 'Appareil'} ➡️ ${rule.action?.commande || ''}`
      };
    })
  ];

  // Gestion de la pagination des recommandations IA
  const [currentRecIndex, setCurrentRecIndex] = useState(0);
  const handleNextRec = () => setCurrentRecIndex(prev => prev === allRecommendations.length - 1 ? 0 : prev + 1);
  const handlePrevRec = () => setCurrentRecIndex(prev => prev === 0 ? allRecommendations.length - 1 : prev - 1);

  // Gestion de la sélection/désélection des jours de répétition
  const toggleJour = (jour) => {
    const exists = newRule.jourRepetition.includes(jour);
    setNewRule({
      ...newRule,
      jourRepetition: exists ? newRule.jourRepetition.filter(j => j !== jour) : [...newRule.jourRepetition, jour]
    });
  };

  // --- SUBMIT : Enregistrement d'une règle ou d'une planification ---
  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.action.appareilCible) {
      alert(language === "العربية" ? "الرجاء اختيار جهاز صالح" : "Veuillez sélectionner un appareil cible valide.");
      return;
    }
    const payload = {
      ...newRule,
      isPlanif: ruleType === 'PLANIF',
      condition: ruleType === 'EVENT' ? newRule.condition : null
    };
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await axios.post('http://localhost:5000/api/rules', payload, { headers });
      setDbRules([...dbRules, res.data]);
      setIsRuleModalOpen(false);
      setSelectedPieceRule('');
      setRuleType('EVENT');
    } catch (err) {
      console.error("Error saving rule:", err);
    }
  };

  // --- SUBMIT : Enregistrement d'une scène ---
  const handleAddScene = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await axios.post('http://localhost:5000/api/scenes', newScene, { headers });
      setDbScenes([...dbScenes, res.data]);
      setIsSceneModalOpen(false);
      setNewScene({ nomScene: '', description: '', icone: 'Moon', actions: [] });
      setSelectedPieceScene(''); 
    } catch (err) {
      console.error("Error saving scene:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-[#f8f9fa]" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* Header Original */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t.automation || "Automatisation"}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {language === "العربية" ? "قم بتهيئة وإعداد مشاهدك الذكية." : "Configure vos scènes intelligentes."}
          </p>
        </div>
        <VoiceControlButton />
      </header>

      {/* Vos Boutons Originaux */}
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

      {/* MODAL SCÈNE ORIGINAL */}
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
              </select>
            </div>
            {/* Filtre Pièce du Scene original */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase block">Configurer les Actions</span>
              <select className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none" value={selectedPieceScene} onChange={e => setSelectedPieceScene(e.target.value)}>
                <option value="">Toutes les pièces</option>
                {piecesDeLaDb.map(p => <option key={p._id || p} value={p._id || p.nomPiece || p}>{p.nomPiece || p}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs" value={currentAction.appareilId} onChange={e => setCurrentAction({...currentAction, appareilId: e.target.value})}>
                  {appareilsFiltresScene.map(app => <option key={app._id || app.id} value={app._id || app.id}>{app.nomAppareil}</option>)}
                </select>
                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs" value={currentAction.commande} onChange={e => setCurrentAction({...currentAction, commande: e.target.value})}>
                  {['ON', 'OFF'].map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => setNewScene({...newScene, actions: [...newScene.actions, currentAction]})} className="w-full py-2 bg-slate-200 text-gray-800 rounded-xl text-xs font-bold">+ Ajouter cette action</button>
            </div>
            <div className="flex justify-end gap-2 pt-2 text-sm font-bold border-t">
              <button type="button" onClick={() => setIsSceneModalOpen(false)} className="px-4 py-2 text-gray-400">Annuler</button>
              <button type="submit" className="px-5 py-2 bg-[#1e293b] text-white rounded-xl">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL RÈGLE ET PLANIFICATION AVEC TON DESIGN ORIGINAL */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <form onSubmit={handleAddRule} className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h3>Nouvelle Règle Intelligente</h3>
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
                {/* Sélecteur de jours pour répétition de la planification */}
                <div className="flex flex-wrap gap-1">
                  {joursSemaine.map(j => (
                    <button type="button" key={j} onClick={() => toggleJour(j)} className={`px-2 py-1 text-[10px] border rounded ${newRule.jourRepetition.includes(j) ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
                      {j.substring(0,3)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bloc Action commun avec Filtre par Pièce */}
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Alors (Action)</span>
              
              <div className="mb-2">
                <select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none" value={selectedPieceRule} onChange={e => setSelectedPieceRule(e.target.value)}>
                  <option value="">Toutes les pièces</option>
                  {piecesDeLaDb.map(p => <option key={p._id || p} value={p._id || p.nomPiece || p}>{p.nomPiece || p}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" value={newRule.action.appareilCible} onChange={e => setNewRule({...newRule, action: {...newRule.action, appareilCible: e.target.value}})}>
                  {appareilsFiltresRule.map(app => <option key={app._id || app.id} value={app._id || app.id}>{app.nomAppareil}</option>)}
                </select>
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs" value={newRule.action.commande} onChange={e => setNewRule({...newRule, action: {...newRule.action, commande: e.target.value}})}>
                  {['ON', 'OFF'].map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
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

      {/* Rendu des sections originales (Scènes, Règles et Recommandations) */}
      <section className="flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">{language === "العربية" ? "المشاهد" : "Les Scènes"}</h2>
        <div className="w-full overflow-x-auto scrollbar-hide pb-6">
          <div className="flex gap-6 w-max pr-10"> 
            {combinedScenes.map((scene, index) => <SceneCard key={index} {...scene} />)}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
        <section className="flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">{language === "العربية" ? "القواعد الذكية" : "Les Règles Intelligentes"}</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {combinedRules.map((rule, index) => <RuleCard key={index} {...rule} />)}
          </div>
        </section>

        <section className="flex flex-col">
          <AIRecommendationCard recommendation={allRecommendations[currentRecIndex]} onNext={handleNextRec} onPrev={handlePrevRec} />
        </section>
      </div>
    </div>
  );
};

export default Automation;