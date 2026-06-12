import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { Plus, Moon, Sun, Home, Film, Utensils, Trash2 } from 'lucide-react'; 
import { Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity } from 'lucide-react';
import RuleCard from '../components/RuleCard';
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';
import AIRecommendationCard from '../components/AIRecommendationCard';

// حماية الترجمات لداخل في حالة وجود مشكل في الملف الخارجي
const localTranslations = {
  "Français": { automation: "Automatisation" },
  "English": { automation: "Automation" },
  "العربية": { automation: "الأتمتة" }
};

const Automation = () => {
  const [language, setLanguage] = useState("Français");

  const [dbRules, setDbRules] = useState([]);
  const [dbScenes, setDbScenes] = useState([]);
  const [allAppareils, setAllAppareils] = useState([]);

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState('');

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

  const [newRule, setNewRule] = useState({
    nomRegle: '',
    priorite: 1,
    condition: { typeAppareil: 'ECLAIRAGE', valeurSeuil: '', operateur: '==' },
    action: { appareilCible: '', commande: 'ON' }
  });

  const [newScene, setNewScene] = useState({
    nomScene: '',
    description: '',
    icone: 'Moon',
    actions: []
  });

  const [currentAction, setCurrentAction] = useState({ appareilId: '', commande: '' });

  // تعريف متغير الترجمة لحل مشكلة الخطأ t is not defined
  const t = localTranslations[language] || localTranslations["Français"];

  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // جلب الـ token من المكان اللي كتخزنو فيه (غالباً localStorage)
    const token = localStorage.getItem('token'); 

    axios.get('http://localhost:5000/api/appareils', {
      headers: {
        'Authorization': `Bearer ${token}` // 👈 هادي هي القطعة الناقصة!
      }
    })
    .then(res => {
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setAllAppareils(data);

      if (data.length > 0) {
        const first = data[0];
        setCurrentAction({
          appareilId: first._id,
          commande: COMMANDES_PAR_TYPE[first.typeAppareil?.toUpperCase()]?.[0] || 'ON'
        });
      }
    })
    .catch(err => console.error("Error fetching devices:", err));
  }, []);

  // جلب الغرف وإدراج غرف افتراضية في حالة كانت قاعدة البيانات خاوية
  const dynamicPieces = Array.from(
    new Set(
      allAppareils
        .map(a => a.piece?.nomPiece || a.piece || a.room)
        .filter(Boolean)
    )
  );
  
  const piecesDeLaDb = dynamicPieces.length > 0 
    ? dynamicPieces 
    : ["Salon", "Cuisine", "Chambre", "Salle de bain", "Couloir"];

  const appareilsFiltres = selectedPiece
    ? allAppareils.filter(a => (a.piece?.nomPiece === selectedPiece || a.piece === selectedPiece || a.room === selectedPiece))
    : allAppareils;

  useEffect(() => {
    if (appareilsFiltres.length > 0) {
      const first = appareilsFiltres[0];
      setCurrentAction({
        appareilId: first._id,
        commande: COMMANDES_PAR_TYPE[first.typeAppareil?.toUpperCase()]?.[0] || 'ON'
      });
    }
  }, [selectedPiece, allAppareils]);

  const scenes = [
    { title: language === "العربية" ? "الوضع الليلي" : language === "English" ? "Night Mode" : "Mode Nuit", icon: Moon, desc: "..." },
    { title: language === "العربية" ? "الروتين الصباحي" : language === "English" ? "Morning Routine" : "Routine Matin", icon: Sun, desc: "..." },
    { title: language === "العربية" ? "وضع الغياب" : language === "English" ? "Away Mode" : "Mode Absence", icon: Home, desc: "..." },
    { title: language === "العربية" ? "وضع السينما" : language === "English" ? "Cinema Mode" : "Mode Cinéma", icon: Film, desc: "..." },
    { title: language === "العربية" ? "وضع المطبخ" : language === "English" ? "Kitchen Mode" : "Mode Cuisine", icon: Utensils, desc: "..." }
  ];

  const rules = [
    { title: "...", icon: Lightbulb, time: "19:00 - 07:00", action: "..." },
    { title: "...", icon: ShieldAlert, time: "24h/24", action: "..." },
    { title: "...", icon: Moon, time: "23:00", action: "..." },
    { title: "...", icon: Thermometer, time: "...", action: "..." }
  ];

  const allRecommendations = [
    { id: 1, text: language === "العربية" ? "استهلاكك للطاقة مرتفع في المطبخ حالياً." : language === "English" ? "Your energy consumption is high in the kitchen." : "Votre consommation est élevée dans la cuisine." },
    { id: 2, text: language === "العربية" ? "بناءً على عاداتك، نقترح تفعيل وضع التوفير عند الساعة 14:00." : language === "English" ? "Based on your habits, activate Eco Mode at 14:00." : "D'après vos habitudes, activez le Mode Économie à 14:00." }
  ];

  const iconMap = {
    Moon, Sun, Home, Film, Utensils,
    Lightbulb, ShieldAlert, Thermometer,
    Radio, Wind, Leaf, Activity
  };

  const combinedScenes = [
    ...scenes,
    ...dbScenes.map(scene => ({
      title: scene.nomScene,
      desc: scene.description,
      icon: iconMap[scene.icone] || Home
    }))
  ];

  const combinedRules = [
    ...rules,
    ...dbRules.map(rule => {
      const appObj = allAppareils.find(
        a => (a._id === rule.action?.appareilCible || a.id === rule.action?.appareilCible)
      );

      return {
        title: rule.nomRegle,
        icon: iconMap[rule.condition?.typeAppareil === 'THERMIQUE' ? 'Thermometer' : 'Lightbulb'] || Activity,
        time: `${rule.condition?.typeAppareil || ''} ${rule.condition?.operateur || ''} ${rule.condition?.valeurSeuil || ''}`,
        action: `Action: ${appObj ? appObj.nomAppareil : 'Appareil'} ➡️ ${rule.action?.commande || ''}`
      };
    })
  ];

  const [currentRecIndex, setCurrentRecIndex] = useState(0);

  const handleNextRec = () => setCurrentRecIndex(prev => prev === allRecommendations.length - 1 ? 0 : prev + 1);
  const handlePrevRec = () => setCurrentRecIndex(prev => prev === 0 ? allRecommendations.length - 1 : prev - 1);

  const handleAddRule = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/rules', newRule);
    setDbRules([...dbRules, res.data]);
    setIsRuleModalOpen(false);
  };

  const handleAddScene = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/scenes', newScene);
    setDbScenes([...dbScenes, res.data]);
    setIsSceneModalOpen(false);
    setNewScene({ nomScene: '', description: '', icone: 'Moon', actions: [] });
  };

  const addActionToScene = () => {
    if (!currentAction.appareilId || !currentAction.commande) return;
    setNewScene({
      ...newScene,
      actions: [...newScene.actions, currentAction]
    });
  };

  const removeActionFromScene = (indexToRemove) => {
    setNewScene({
      ...newScene,
      actions: newScene.actions.filter((_, index) => index !== indexToRemove)
    });
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-[#f8f9fa]" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{t.automation || "Automatisation"}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {language === "العربية" ? "قم بتهيئة وإعداد مشاهدك الذكية." : language === "English" ? "Configure your smart scenes." : "Configure vos scènes intelligentes."}
          </p>
        </div>
        <VoiceControlButton />
      </header>

      {/* Buttons */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button onClick={() => setIsSceneModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
          <Plus size={18} />
          {language === "العربية" ? "إضافة مشهد" : language === "English" ? "Add a scene" : "Ajouter une scène"}
        </button>
        <button onClick={() => setIsRuleModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors">
          <Plus size={18} />
          {language === "العربية" ? "إضافة قاعدة" : language === "English" ? "Add a rule" : "Ajouter une règle"}
        </button>
      </div>

      {/* MODAL : CREATION SCÈNE */}
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

            {/* CONFIGURATION ACTIONS */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase block">Configurer les Actions</span>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Filtrer par Pièce</label>
                <select 
                  className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  value={selectedPiece}
                  onChange={e => setSelectedPiece(e.target.value)}
                >
                  <option value="">Toutes les pièces</option>
                  {piecesDeLaDb.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none" 
                  value={currentAction.appareilId}
                  onChange={e => {
                    const selectedApp = allAppareils.find(a => (a._id === e.target.value || a.id === e.target.value));
                    setCurrentAction({
                      appareilId: e.target.value,
                      commande: COMMANDES_PAR_TYPE[selectedApp?.typeAppareil]?.[0] || 'ON'
                    });
                  }}
                >
                  {appareilsFiltres.length === 0 ? (
                    <option value="">Aucun appareil trouvé</option>
                  ) : (
                    appareilsFiltres.map(app => (
                      <option key={app._id || app.id} value={app._id || app.id}>
                        {app.nomAppareil} [{app.piece?.nomPiece || app.piece || app.room || 'Sans pièce'}]
                      </option>
                    ))
                  )}
                </select>

                <select className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  value={currentAction.commande}
                  disabled={appareilsFiltres.length === 0}
                  onChange={e => setCurrentAction({...currentAction, commande: e.target.value})}
                >
                  {appareilsFiltres.length === 0 ? (
                    <option value="">---</option>
                  ) : (
                    (COMMANDES_PAR_TYPE[allAppareils.find(a => (a._id === currentAction.appareilId || a.id === currentAction.appareilId))?.typeAppareil] || ['ON', 'OFF']).map(cmd => (
                      <option key={cmd} value={cmd}>{cmd}</option>
                    ))
                  )}
                </select>
              </div>

              <button 
                type="button" 
                disabled={appareilsFiltres.length === 0} 
                onClick={addActionToScene} 
                className="w-full py-2 bg-slate-200 text-gray-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors disabled:opacity-40"
              >
                + Ajouter cette action à la scène
              </button>
            </div>

            {/* LISTE ACTIONS */}
            {newScene.actions.length > 0 && (
              <div className="space-y-2">
                <div className="max-h-[120px] overflow-y-auto space-y-1.5">
                  {newScene.actions.map((act, index) => {
                    const appObj = allAppareils.find(a => (a._id === act.appareilId || a.id === act.appareilId));
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                        <span>🎬 {appObj?.nomAppareil || 'Appareil'} ➡️ <strong>{act.commande}</strong></span>
                        <button type="button" onClick={() => removeActionFromScene(index)} className="text-red-500"><Trash2 size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 text-sm font-bold border-t border-gray-100">
              <button type="button" onClick={() => setIsSceneModalOpen(false)} className="px-4 py-2 text-gray-400">Annuler</button>
              <button type="submit" disabled={newScene.actions.length === 0} className="px-5 py-2 bg-[#1e293b] text-white rounded-xl disabled:opacity-50">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL : CREATION RÈGLE */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <form onSubmit={handleAddRule} className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">Nouvelle Règle Intelligente</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Nom de la règle</label>
              <input type="text" required className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" onChange={e => setNewRule({...newRule, nomRegle: e.target.value})} />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Si (Condition)</span>
              <div className="grid grid-cols-3 gap-2">
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, typeAppareil: e.target.value}})}>
                  <option value="THERMIQUE">THERMIQUE</option>
                  <option value="CAPTEUR">CAPTEUR</option>
                  <option value="ECLAIRAGE">ECLAIRAGE</option>
                </select>
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, operateur: e.target.value}})}>
                  <option value="==">==</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                </select>
                <input type="text" required placeholder="Seuil" className="p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none w-full" onChange={e => setNewRule({...newRule, condition: {...newRule.condition, valeurSeuil: e.target.value}})} />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl space-y-2 border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Alors (Action)</span>
              <div className="grid grid-cols-2 gap-2">
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none" 
                  value={newRule.action.appareilCible}
                  onChange={e => {
                    const selectedApp = allAppareils.find(a => (a._id === e.target.value || a.id === e.target.value));
                    setNewRule({
                      ...newRule,
                      action: { appareilCible: e.target.value, commande: COMMANDES_PAR_TYPE[selectedApp?.typeAppareil]?.[0] || 'ON' }
                    });
                  }}
                >
                  {allAppareils.length === 0 ? <option value="">Aucun appareil</option> : allAppareils.map(app => <option key={app._id || app.id} value={app._id || app.id}>{app.nomAppareil}</option>)}
                </select>
                <select className="p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                  value={newRule.action.commande}
                  onChange={e => setNewRule({...newRule, action: {...newRule.action, commande: e.target.value}})}
                >
                  {(COMMANDES_PAR_TYPE[allAppareils.find(a => (a._id === newRule.action.appareilCible || a.id === newRule.action.appareilCible))?.typeAppareil] || ['ON', 'OFF']).map(cmd => <option key={cmd} value={cmd}>{cmd}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-sm font-bold">
              <button type="button" onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 text-gray-400">Annuler</button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* Affichage المشاهد */}
      <section className="flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
          {language === "العربية" ? "المشاهد" : language === "English" ? "Scenes" : "Les Scènes"}
        </h2>
        <div className="w-full overflow-x-auto scrollbar-hide pb-6">
          <div className="flex gap-6 w-max pr-10"> 
            {combinedScenes.map((scene, index) => (
              <SceneCard key={index} {...scene} />
            ))}
          </div>
        </div>
      </section>

      {/* القواعد والترشيحات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
        <section className="flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
            {language === "العربية" ? "القواعد الذكية" : language === "English" ? "Smart Rules" : "Les Règles Intelligentes"}
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {combinedRules.map((rule, index) => (
              <RuleCard key={index} {...rule} />
            ))}
          </div>
        </section>

        <section className="flex flex-col">
          <AIRecommendationCard 
            recommendation={allRecommendations[currentRecIndex]} 
            onNext={handleNextRec}
            onPrev={handlePrevRec}
          />
        </section>
      </div>
    </div>
  );
};

export default Automation;