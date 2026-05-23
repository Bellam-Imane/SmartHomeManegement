import React, { useState, useEffect } from 'react';
import { Plus, Moon, Sun, Home, Film, Utensils } from 'lucide-react'; 
import { Lightbulb, ShieldAlert, Thermometer, Radio, Wind, Leaf, Activity } from 'lucide-react';
import RuleCard from '../components/RuleCard';
import VoiceControlButton from '../components/VoiceControlButton';
import SceneCard from '../components/SceneCard';
import AIRecommendationCard from '../components/AIRecommendationCard';


const { translations } = require("../translations");

const Automation = () => {
  const [language, setLanguage] = useState("Français");

 
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = translations[language] || translations["Français"];

  
  const scenes = [
    { 
      title: language === "العربية" ? "الوضع الليلي" : language === "English" ? "Night Mode" : "Mode Nuit", 
      icon: Moon, 
      desc: language === "العربية" ? "إطفاء جميع الأنوار، إغلاق الستائر وتفعيل إنذار المحيط." : language === "English" ? "Turns off all lights, closes shutters and activates perimeter alarm." : "Éteint toutes les lumières, ferme les volets et active l'alarme périmétrique." 
    },
    { 
      title: language === "العربية" ? "الروتين الصباحي" : language === "English" ? "Morning Routine" : "Routine Matin", 
      icon: Sun, 
      desc: language === "العربية" ? "فتح الستائر بنسبة 50%، تشغيل آلة القهوة وتشغيل الراديو." : language === "English" ? "Opens curtains to 50%, starts the coffee machine and turns on the radio." : "Ouvre les rideaux à 50%, lance la machine à café et met la radio." 
    },
    { 
      title: language === "العربية" ? "وضع الغياب" : language === "English" ? "Away Mode" : "Mode Absence", 
      icon: Home, 
      desc: language === "العربية" ? "محاكاة التواجد بالمنزل عن طريق الأنوار وقطع الطاقة عن المقابس غير الضرورية." : language === "English" ? "Simulates presence with lights and cuts off unnecessary plugs." : "Simule une présence avec les lumières et coupe les prises inutiles." 
    },
    { 
      title: language === "العربية" ? "وضع السينما" : language === "English" ? "Cinema Mode" : "Mode Cinéma", 
      icon: Film, 
      desc: language === "العربية" ? "خفض الإضاءة إلى 10%، إغلاق الستائر وتشغيل السينما المنزلية." : language === "English" ? "Dims brightness to 10%, closes blinds and turns on home cinema." : "Baisse la luminosité à 10%, ferme les stores et allume le home cinéma." 
    },
    { 
      title: language === "العربية" ? "وضع المطبخ" : language === "English" ? "Kitchen Mode" : "Mode Cuisine", 
      icon: Utensils, 
      desc: language === "العربية" ? "تحسين إضاءة أسطح العمل وتفعيل نظام التهوية." : language === "English" ? "Optimizes countertop lighting and activates the hood." : "Optimise l'éclairage des plans de travail et active la hotte." 
    }
  ];

  
  const rules = [
    { 
      title: language === "العربية" ? "الإضاءة التلقائية" : language === "English" ? "Automatic Light" : "Lumière Automatique", 
      icon: Lightbulb, 
      time: "19:00 - 07:00", 
      action: language === "العربية" ? "تشغيل أضواء الممر في حالة رصد أي حركة." : language === "English" ? "Turn on hallway lights if motion is detected." : "Allumer les lumières du couloir si un mouvement est détecté." 
    },
    { 
      title: language === "العربية" ? "تنبيه الباب" : language === "English" ? "Door Alert" : "Alerte Porte", 
      icon: ShieldAlert, 
      time: "24h/24", 
      action: language === "العربية" ? "إرسال إشعار إذا ظل الباب مفتوحاً لأكثر من 5 دقائق." : language === "English" ? "Send a notification if the door remains open for more than 5 min." : "Envoyer une notification si la porte reste ouverte plus de 5 min." 
    },
    { 
      title: language === "العربية" ? "الأمن الليلي" : language === "English" ? "Night Security" : "Sécurité Nuit", 
      icon: Moon, 
      time: "23:00", 
      action: language === "العربية" ? "قفل جميع الأقفال وتفعيل الكاميرات الخارجية." : language === "English" ? "Lock all locks and activate outdoor cameras." : "Verrouiller toutes les serrures et activer les caméras extérieures." 
    },
    { 
      title: language === "العربية" ? "التكييف الذكي" : language === "English" ? "Smart Climate" : "Clim Intelligent", 
      icon: Thermometer, 
      time: language === "العربية" ? "حسب الحرارة" : language === "English" ? "By temp." : "Selon temp.", 
      action: language === "العربية" ? "تشغيل المكيف إذا تجاوزت درجة الحرارة 26 درجة في غرفة المعيشة." : language === "English" ? "Start AC if temperature exceeds 26°C in the living room." : "Lancer la clim si la température dépasse 26°C dans le salon." 
    },
    { 
      title: language === "العربية" ? "حضور افتراضي" : language === "English" ? "Virtual Presence" : "Présence Virtuelle", 
      icon: Radio, 
      time: language === "العربية" ? "أثناء الغياب" : language === "English" ? "During absence" : "Pendant absence", 
      action: language === "العربية" ? "تشغيل الراديو والأنوار بشكل عشوائي لمحاكاة التواجد بالمنزل." : language === "English" ? "Turn on radio and lights randomly to simulate presence." : "Allumer la radio et les lumières aléatoirement pour simuler une présence." 
    },
    { 
      title: language === "العربية" ? "تنبيه الرياح القوية" : language === "English" ? "Strong Wind Alert" : "Alerte Vent Fort", 
      icon: Wind, 
      time: language === "العربية" ? "إذا كانت الرياح > 50 كم/س" : language === "English" ? "If wind > 50km/h" : "Si vent > 50km/h", 
      action: language === "العربية" ? "إغلاق الستائر الخارجية والنوافذ تلقائياً لحمايتها." : language === "English" ? "Automatically close outdoor blinds and windows." : "Fermer automatiquement les stores extérieurs et les fenêtres." 
    },
    { 
      title: language === "العربية" ? "توفير الطاقة" : language === "English" ? "Energy Saving" : "Économie d'énergie", 
      icon: Leaf, 
      time: "14:00 - 17:00", 
      action: language === "العربية" ? "تقليل طاقة الأجهزة غير الضرورية خلال ساعات الذروة." : language === "English" ? "Reduce power of non-essential devices during peak hours." : "Réduire la puissance des appareils non essentiels pendant les pics." 
    },
    { 
      title: language === "العربية" ? "صيانة المحركات" : language === "English" ? "Motor Health" : "Santé du moteur", 
      icon: Activity, 
      time: language === "العربية" ? "أسبوعي" : language === "English" ? "Weekly" : "Hebdomadaire", 
      action: language === "العربية" ? "اختبار تلقائي لمحركات الستائر للتحقق من مدى التآكل." : language === "English" ? "Auto-test shutter motors to check for wear and tear." : "Auto-test des moteurs de volets pour vérifier l'usure." 
    }
  ];

  
  const allRecommendations = [
    { id: 1, text: language === "العربية" ? "استهلاكك للطاقة مرتفع في المطبخ حالياً." : language === "English" ? "Your energy consumption is high in the kitchen." : "Votre consommation est élevée dans la cuisine." },
    { id: 2, text: language === "العربية" ? "بناءً على عاداتك، نقترح تفعيل وضع التوفير عند الساعة 14:00." : language === "English" ? "Based on your habits, activate Eco Mode at 14:00." : "D'après vos habitudes, activez le Mode Économie à 14:00." },
    { id: 3, text: language === "العربية" ? "درجات الحرارة ستنخفض قريباً، أغلق الستائر عند الساعة 18:00." : language === "English" ? "The temperature is going to drop, close the shutters at 18:00." : "La température va chuter, fermez les volets à 18:00." },
    { id: 4, text: language === "العربية" ? "لم يتم رصد أي حركة منذ ساعتين، هل ترغب في إطفاء الأنوار؟" : language === "English" ? "No motion detected for 2h, turn off the lights?" : "Aucun mouvement détecté depuis 2h, éteindre les lumières ?" }
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
    <div className="min-h-screen flex flex-col p-8 bg-[#f8f9fa]" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* Header  */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            {t.automation || "Automatisation"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">
            {language === "العربية" ? "قم بتهيئة وإعداد مشاهدك الذكية." : language === "English" ? "Configure your smart scenes." : "Configure vos scènes intelligentes."}
          </p>
        </div>
        <VoiceControlButton />
      </header>

      {/* Buttons  */}
      <div className="mt-8 flex items-center justify-end gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-full font-bold text-sm">
          <Plus size={18} />
          {language === "العربية" ? "إضافة مشهد" : language === "English" ? "Add a scene" : "Ajouter une scène"}
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-sm">
          <Plus size={18} />
          {language === "العربية" ? "إضافة قاعدة" : language === "English" ? "Add a rule" : "Ajouter une règle"}
        </button>
      </div>

      {/* Les Scènes*/}
      <section className="flex flex-col min-h-0">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
          {language === "العربية" ? "المشاهد" : language === "English" ? "Scenes" : "Les Scènes"}
        </h2>
        
        <div className="w-full overflow-x-auto scrollbar-hide pb-6">
          <div className="flex gap-6 w-max pr-10"> 
            {scenes.map((scene, index) => (
              <SceneCard key={index} {...scene} />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
        
        {/* Les Règles Intelligentes */}
        <section className="flex flex-col min-h-0">
          <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">
            {language === "العربية" ? "القواعد الذكية" : language === "English" ? "Smart Rules" : "Les Règles Intelligentes"}
          </h2>
          
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