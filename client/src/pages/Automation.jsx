import React, { useState } from 'react';
import { Plus, Moon, Sun, Home, Film, Utensils } from 'lucide-react'; 
import { Lightbulb, ShieldAlert,  Thermometer, Radio, Wind, Leaf, Activity, Cpu } from 'lucide-react';
import RuleCard from '../components/RuleCard';
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';
import AIRecommendationCard from '../components/AIRecommendationCard';

const Automation = () => {
 
  const scenes = [
    { title: "Mode Nuit", icon: Moon, desc: "Éteint toutes les lumières, ferme les volets et active l'alarme périmétrique." },
    { title: "Routine Matin", icon: Sun, desc: "Ouvre les rideaux à 50%, lance la machine à café et met la radio." },
    { title: "Mode Absence", icon: Home, desc: "Simule une présence avec les lumières et coupe les prises inutiles." },
    { title: "Mode Cinéma", icon: Film, desc: "Baisse la luminosité à 10%, ferme les stores et allume le home cinéma." },
    { title: "Mode Cuisine", icon: Utensils, desc: "Optimise l'éclairage des plans de travail et active la hotte." }
  ];

  const rules = [
  { title: "Lumière Automatique", icon: Lightbulb, time: "19:00 - 07:00", action: "Allumer les lumières du couloir si un mouvement est détecté." },
  { title: "Alerte Porte", icon: ShieldAlert, time: "24h/24", action: "Envoyer une notification si la porte reste ouverte plus de 5 min." },
  { title: "Sécurité Nuit", icon: Moon, time: "23:00", action: "Verrouiller toutes les serrures et activer les caméras extérieures." },
  { title: "Clim Intelligent", icon: Thermometer, time: "Selon temp.", action: "Lancer la clim si la température dépasse 26°C dans le salon." },
  { title: "Présence Virtuelle", icon: Radio, time: "Pendant absence", action: "Allumer la radio et les lumières aléatoirement pour simuler une présence." },
  { title: "Alerte Vent Fort", icon: Wind, time: "Si vent > 50km/h", action: "Fermer automatiquement les stores extérieurs et les fenêtres." },
  { title: "Économie d'énergie", icon: Leaf, time: "14:00 - 17:00", action: "Réduire la puissance des appareils non essentiels pendant les pics." },
  { title: "Santé du moteur", icon: Activity, time: "Hebdomadaire", action: "Auto-test des moteurs de volets pour vérifier l'usure." }
  ];

  const allRecommendations = [
    { id: 1, text: "Votre consommation est élevée dans la cuisine." },
    { id: 2, text: "D'après vos habitudes, activez le Mode Économie à 14:00." },
    { id: 3, text: "La température va chuter, fermez les volets à 18:00." },
    { id: 4, text: "Aucun mouvement détecté depuis 2h, éteindre les lumières ?" }
  ];

  const [currentRecIndex, setCurrentRecIndex] = useState(0);

  const handleNextRec = () => {
    setCurrentRecIndex((prevIndex) => 
      prevIndex === allRecommendations.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevRec = () => {
    setCurrentRecIndex((prevIndex) => 
      prevIndex === 0 ? allRecommendations.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-[#f8f9fa]">
      {/* Header  */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Automatisation</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Configurez vos scènes intelligentes.</p>
        </div>
        <VoiceControlButton />
      </header>

      {/* Buttons  */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-full font-bold text-sm"><Plus size={18} />Ajouter une scène</button>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-sm"><Plus size={18} />Ajouter une règle</button>
      </div>

      {/* Les Scènes*/}
      <section className="flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Les Scènes</h2>
        
        <div className="w-full overflow-x-auto scrollbar-hide pb-6">
          <div className="flex gap-6 w-max pr-10"> 
            {scenes.map((scene, index) => (
              <SceneCard key={index} {...scene} />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
        
        {/*  Les Règles Intelligentes */}
        <section className="flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Les Règles Intelligentes</h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
            {rules.map((rule, index) => (
              <RuleCard key={index} {...rule} />
            ))}
          </div>
        </section>

        {/*AI Recommendations */}
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