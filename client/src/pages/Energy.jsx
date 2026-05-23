import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Sun, AirVent, Refrigerator, Tv, Lightbulb } from "lucide-react";
import VoiceControlButton from "../components/VoiceControlButton";
import { useNavigate } from 'react-router-dom';

const { translations } = require("../translations");

// Jetons de conception (Design Tokens)
const BLACK = "#000000";
const MUTED = "#6B7280"; 
const XMUTED = "#9CA3AF";

const COLORS = {
  ac: "#EF4444",
  frigo: "#F97316",
  tv: "#EAB308",
  lumiere: "#22C55E",
  chart: "#8DB0C6",
  blue: "#3B82F6",
};

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid #F1F5F9",
};

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────
const StatCard = ({ label, value }) => (
  <div style={{ ...cardStyle, padding: "20px" }} className="flex-1 min-w-[140px]">
    <p style={{ fontSize: "12px", color: MUTED, fontWeight: "500", marginBottom: "8px" }}>{label}</p>
    <p style={{ fontSize: "24px", fontWeight: "800", color: BLACK }}>{value}</p>
  </div>
);

const DeviceCard = ({ d, labelName }) => (
  <div style={{ ...cardStyle, padding: "16px", display: "flex", alignItems: "center", gap: "15px" }}>
    <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "12px" }}>
      <d.Icon size={20} color={BLACK} strokeWidth={2} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontWeight: "700", color: BLACK }}>{labelName}</span>
        <span style={{ color: MUTED, fontSize: "12px" }}>{d.kwh} kWh</span>
      </div>
      <div style={{ height: "8px", background: "#F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ width: `${d.pct}%`, height: "100%", background: d.color, borderRadius: "10px" }} />
      </div>
    </div>
    <span style={{ fontWeight: "800", fontSize: "14px", color: BLACK, marginLeft: "10px" }}>{d.pct}%</span>
  </div>
);

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
const Energy = () => {
  const navigate = useNavigate(); 
  const [language, setLanguage] = useState("Français");
  const [activeTab, setActiveTab] = useState("Mois"); 
  const [isVoiceActive, setIsVoiceActive] = useState(false); 

  
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

  
  const labelsJour = t.labelsJour || translations["Français"].labelsJour;
  const labelsMois = t.labelsMois || translations["Français"].labelsMois;
  const labelsAnnees = t.labelsAnnees || translations["Français"].labelsAnnees;

  const dataByTab = {
    Jour: [
      { label: labelsJour[0], energy: 15, temp: 18 },
      { label: labelsJour[1], energy: 22, temp: 20 },
      { label: labelsJour[2], energy: 18, temp: 19 },
      { label: labelsJour[3], energy: 25, temp: 22 },
      { label: labelsJour[4], energy: 30, temp: 24 },
      { label: labelsJour[5], energy: 28, temp: 23 },
      { label: labelsJour[6], energy: 20, temp: 21 },
    ],
    Mois: [
      { label: labelsMois[0], energy: 80, temp: 5 },
      { label: labelsMois[1], energy: 120, temp: 8 },
      { label: labelsMois[2], energy: 150, temp: 12 },
      { label: labelsMois[3], energy: 190, temp: 18 },
      { label: labelsMois[4], energy: 220, temp: 22 },
      { label: labelsMois[5], energy: 280, temp: 28 },
      { label: labelsMois[6], energy: 310, temp: 32 },
      { label: labelsMois[7], energy: 290, temp: 30 },
      { label: labelsMois[8], energy: 240, temp: 25 },
      { label: labelsMois[9], energy: 180, temp: 18 },
      { label: labelsMois[10], energy: 130, temp: 10 },
      { label: labelsMois[11], energy: 90, temp: 4 },
    ],
    Années: [
      { label: labelsAnnees[0], energy: 1800, temp: 16 },
      { label: labelsAnnees[1], energy: 2100, temp: 17 },
      { label: labelsAnnees[2], energy: 2400, temp: 16 },
      { label: labelsAnnees[3], energy: 2150, temp: 18 },
      { label: labelsAnnees[4], energy: 2600, temp: 17 },
    ]
  };

  const currentChartData = dataByTab[activeTab] || dataByTab["Mois"];


  const devices = [
    { id: "ac", Icon: AirVent, kwh: 50, pct: 70, color: COLORS.ac, fallback: "AC" },
    { id: "frigo", Icon: Refrigerator, kwh: 30, pct: 40, color: COLORS.frigo, fallback: "Frigo" },
    { id: "tv", Icon: Tv, kwh: 20, pct: 25, color: COLORS.tv, fallback: "TV" },
    { id: "lumiere", Icon: Lightbulb, kwh: 10, pct: 15, color: COLORS.lumiere, fallback: "Lumière" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans" dir={language === "العربية" ? "rtl" : "ltr"}>
      
      {/* ─── 1. SECTION EN-TÊTE ─── */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-black text-black">
          {language === "العربية" ? "استهلاك الطاقة" : language === "English" ? "Energy Consumption" : "Consommation d'Énergie"}
        </h1>

        <VoiceControlButton 
          isActive={isVoiceActive} 
          onClick={() => setIsVoiceActive(!isVoiceActive)} 
        />
      </div>

      {/* ─── 2. MISE EN PAGE DU CONTENU PRINCIPAL ─── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLONNE GAUCHE */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard 
              label={language === "العربية" ? "الاستهلاك الحالي" : language === "English" ? "Current Consumption" : "Consommation Actuelle"} 
              value="12 kWh" 
            />
            <StatCard 
              label={language === "العربية" ? "الاستهلاك اليومي" : language === "English" ? "Today's Consumption" : "Consommation Aujourd'hui"} 
              value="12 kWh" 
            />
            <StatCard 
              label={language === "العربية" ? "الاستهلاك الشهري" : language === "English" ? "Monthly Consumption" : "Consommation Mensuelle"} 
              value="240 kWh" 
            />
            <StatCard 
              label={language === "العربية" ? "التكلفة التقديرية" : language === "English" ? "Estimated Cost" : "Coût Estimé"} 
              value="240 DH" 
            />
          </div>

          <div style={{ ...cardStyle, padding: "24px" }} className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-black text-sm md:text-base">
                {language === "العربية" ? "استهلاك الطاقة بمرور الوقت" : language === "English" ? "Energy consumption over time" : "Consommation d'énergie au fil du temps"}
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-full overflow-x-auto max-w-full">
                {["Jour", "Mois", "Années"].map((tab) => {
                  let tabLabel = tab;
                  if (language === "العربية") {
                    if (tab === "Jour") tabLabel = "يوم";
                    if (tab === "Mois") tabLabel = "شهر";
                    if (tab === "Années") tabLabel = "سنوات";
                  } else if (language === "English") {
                    if (tab === "Jour") tabLabel = "Day";
                    if (tab === "Mois") tabLabel = "Month";
                    if (tab === "Années") tabLabel = "Years";
                  }
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                        activeTab === tab ? "bg-black text-white" : "text-gray-500"
                      }`}
                    >
                      {tabLabel}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={currentChartData}>
                  <CartesianGrid vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: XMUTED, fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: XMUTED, fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="energy" fill={COLORS.chart} radius={[6, 6, 0, 0]} barSize={30} />
                  <Line type="monotone" dataKey="temp" stroke={BLACK} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">
              {language === "العربية" ? "الاستهلاك حسب الجهاز" : language === "English" ? "Consumption by device" : "Consommation par appareil"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((d) => {
          
                let labelName = d.fallback;
                if (d.id === "ac") labelName = t.climatiseur || d.fallback;
                if (d.id === "frigo") labelName = language === "العربية" ? "المكيف" : t.aspirateur ? "Frigo" : d.fallback; // تعديل حسب كود الترجمة
                if (d.id === "tv") labelName = language === "العربية" ? "التلفاز" : d.fallback;
                if (d.id === "lumiere") labelName = t.lumiereEs || d.fallback;

                return <DeviceCard key={d.id} d={d} labelName={labelName} />;
              })}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6">
          
          <div style={{ ...cardStyle, padding: "24px" }}>
            <h3 className="font-bold text-black mb-4">
              {language === "العربية" ? "الطاقة التقديرية" : language === "English" ? "Estimated Energy" : "Énergie estimée"}
            </h3>
            <div className="bg-[#ffffff] border border-gray-100 shadow-md p-4 rounded-2xl mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <Zap size={18} color={BLACK} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === "العربية" ? (
                  <>تقدير نفقات الطاقة الخاصة بك هذا الشهر هو <span className="font-bold text-black">154,99 DH</span></>
                ) : language === "English" ? (
                  <>Your estimated energy expenditure this month is <span className="font-bold text-black">154.99 DH</span></>
                ) : (
                  <>Votre estimation des dépenses d'énergie ce mois-ci est de <span className="font-bold text-black">154,99 DH</span></>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black w-[65%]" />
               </div>
               <span className="font-bold text-sm text-black">240 DH</span>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }} className="flex flex-col items-start">
            <h3 className="font-bold text-black mb-6 md:mb-10 whitespace-nowrap">
              {t.energyOverview || "Répartition d'Énergie"}
            </h3>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-10 w-full">
              <div className="flex items-center gap-3 p-3 bg-[#ffffff] shadow-md rounded-2xl border border-gray-100 w-full">
                 <Sun size={18} color={BLACK} />
                 <div style={{ textAlign: language === "العربية" ? "right" : "left" }}>
                   <p className="text-[10px] text-gray-500">{t.solarEnergy || "Solaire"}</p>
                   <p className="font-bold text-sm text-black">8.2 kWh</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#ffffff] shadow-md rounded-2xl border border-gray-100 w-full">
                 <Zap size={18} color={BLACK} />
                 <div style={{ textAlign: language === "العربية" ? "right" : "left" }}>
                   <p className="text-[10px] text-gray-500">{language === "العربية" ? "كهرباء" : "Énergie"}</p>
                   <p className="font-bold text-sm text-black">2.1 kWh</p>
                 </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Energy;