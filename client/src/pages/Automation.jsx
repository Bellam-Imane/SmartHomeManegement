import React from 'react';
import { Plus, Moon, Sun, Home, Film, Utensils } from 'lucide-react'; 
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';

const Automation = () => {
 
  const scenes = [
    { title: "Mode Nuit", icon: Moon, desc: "Éteint toutes les lumières, ferme les volets et active l'alarme périmétrique." },
    { title: "Routine Matin", icon: Sun, desc: "Ouvre les rideaux à 50%, lance la machine à café et met la radio." },
    { title: "Mode Absence", icon: Home, desc: "Simule une présence avec les lumières et coupe les prises inutiles." },
    { title: "Mode Cinéma", icon: Film, desc: "Baisse la luminosité à 10%, ferme les stores et allume le home cinéma." },
    { title: "Mode Cuisine", icon: Utensils, desc: "Optimise l'éclairage des plans de travail et active la hotte." }
  ];

  return (
    <div className="flex-1 min-w-0 h-screen flex flex-col p-8 bg-[#f8f9fa] overflow-hidden">
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
      <div className="mt-12 flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2 shrink-0">Les Scènes</h2>
        
        {/*scroll*/}
        <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
          <div className="flex gap-6 pr-8"> 
            {scenes.map((scene, index) => (
              <SceneCard 
                key={index}
                title={scene.title}
                icon={scene.icon}
                desc={scene.desc}
              />
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Automation;