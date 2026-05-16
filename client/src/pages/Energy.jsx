import { useState } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Sun, AirVent, Refrigerator, Tv, Lightbulb, Bell } from "lucide-react";
import VoiceControlButton from "../components/VoiceControlButton";
import { useNavigate } from 'react-router-dom'; // Importation de useNavigate

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

// ─── DONNÉES DU GRAPHIQUE PAR ONGLET (JOURS, MOIS, ANNÉES) ───────────────────
const dataByTab = {
  Jour: [
    { label: "Lun", energy: 15, temp: 18 },
    { label: "Mar", energy: 22, temp: 20 },
    { label: "Mer", energy: 18, temp: 19 },
    { label: "Jeu", energy: 25, temp: 22 },
    { label: "Ven", energy: 30, temp: 24 },
    { label: "Sam", energy: 28, temp: 23 },
    { label: "Dim", energy: 20, temp: 21 },
  ],
  Mois: [
    { label: "Jan", energy: 80, temp: 5 },
    { label: "Fév", energy: 120, temp: 8 },
    { label: "Mar", energy: 150, temp: 12 },
    { label: "Avr", energy: 190, temp: 18 },
    { label: "Mai", energy: 220, temp: 22 },
    { label: "Jun", energy: 280, temp: 28 },
    { label: "Jul", energy: 310, temp: 32 },
    { label: "Aoû", energy: 290, temp: 30 },
    { label: "Sep", energy: 240, temp: 25 },
    { label: "Oct", energy: 180, temp: 18 },
    { label: "Nov", energy: 130, temp: 10 },
    { label: "Déc", energy: 90, temp: 4 },
  ],
  Années: [
    { label: "2022", energy: 1800, temp: 16 },
    { label: "2023", energy: 2100, temp: 17 },
    { label: "2024", energy: 2400, temp: 16 },
    { label: "2025", energy: 2150, temp: 18 },
    { label: "2026", energy: 2600, temp: 17 },
  ]
};

// ─── DONNÉES DES APPAREILS ───────────────────────────────────────────────────
const devices = [
  { name: "AC", Icon: AirVent, kwh: 50, pct: 70, color: COLORS.ac },
  { name: "Frigo", Icon: Refrigerator, kwh: 30, pct: 40, color: COLORS.frigo },
  { name: "TV", Icon: Tv, kwh: 20, pct: 25, color: COLORS.tv },
  { name: "Lumière", Icon: Lightbulb, kwh: 10, pct: 15, color: COLORS.lumiere },
];

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────
const StatCard = ({ label, value }) => (
  <div style={{ ...cardStyle, padding: "20px" }} className="flex-1 min-w-[140px]">
    <p style={{ fontSize: "12px", color: MUTED, fontWeight: "500", marginBottom: "8px" }}>{label}</p>
    <p style={{ fontSize: "24px", fontWeight: "800", color: BLACK }}>{value}</p>
  </div>
);

const DeviceCard = ({ d }) => (
  <div style={{ ...cardStyle, padding: "16px", display: "flex", alignItems: "center", gap: "15px" }}>
    <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "12px" }}>
      <d.Icon size={20} color={BLACK} strokeWidth={2} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontWeight: "700", color: BLACK }}>{d.name}</span>
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
  const navigate = useNavigate(); // Définition indispensable de navigate ici
  const [activeTab, setActiveTab] = useState("Mois"); 
  const [isVoiceActive, setIsVoiceActive] = useState(false); 

  const currentChartData = dataByTab[activeTab];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans">
      
      {/* ─── 1. SECTION EN-TÊTE (Titre, Notifications et Contrôle Vocal) ─── */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-black text-black">Consommation d'Énergie</h1>
        
        <div className="flex items-center gap-4">
          {/* Badge de la cloche de notification stylisé */}
          <div 
            onClick={() => navigate('/home/Notifications')} 
            style={{
              background: 'white', 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
              cursor: 'pointer',
              border: '1px solid #e5e7eb'
            }}
          >
            <Bell size={20} color="#1a1a2e" />
            <div style={{
              position: 'absolute', 
              top: '2px', 
              right: '2px', 
              background: 'white',
              border: '1.5px solid #f0f2f5', 
              borderRadius: '50%', 
              width: '16px', 
              height: '16px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '9px', 
              fontWeight: 'bold'
            }}>
              2
            </div>
          </div>

          <VoiceControlButton 
            isActive={isVoiceActive} 
            onClick={() => setIsVoiceActive(!isVoiceActive)} 
          />
        </div>
      </div>

      {/* ─── 2. MISE EN PAGE DU CONTENU PRINCIPAL ─── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* COLONNE GAUCHE */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Consommation Actuelle" value="12 kWh" />
            <StatCard label="Consommation Aujourd'hui" value="12 kWh" />
            <StatCard label="Consommation Mensuelle" value="240 kWh" />
            <StatCard label="Coût Estimé" value="18 $" />
          </div>

          <div style={{ ...cardStyle, padding: "24px" }} className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="font-bold text-black text-sm md:text-base">Consommation d'énergie au fil du temps</h3>
              <div className="flex bg-gray-100 p-1 rounded-full overflow-x-auto max-w-full">
                {["Jour", "Mois", "Années"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab ? "bg-black text-white" : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
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
            <h3 className="font-bold text-black mb-4">Consommation par appareil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((d) => <DeviceCard key={d.name} d={d} />)}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE */}
        <div className="w-full lg:w-[280px] flex flex-col gap-6">
          
          <div style={{ ...cardStyle, padding: "24px" }}>
            <h3 className="font-bold text-black mb-4">Énergie estimée</h3>
            <div className="bg-[#ffffff] border border-gray-100 shadow-md p-4 rounded-2xl mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                <Zap size={18} color={BLACK} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre estimation des dépenses d'énergie ce mois-ci est de <span className="font-bold text-black">154,99 €</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black w-[65%]" />
               </div>
               <span className="font-bold text-sm text-black">240 €</span>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }} className="flex flex-col items-start">
            <h3 className="font-bold text-black mb-6 md:mb-10 whitespace-nowrap">Répartition d'Énergie</h3>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-10 w-full">
              <div className="flex items-center gap-3 p-3 bg-[#ffffff] shadow-md rounded-2xl border border-gray-100 w-full">
                 <Sun size={18} color={BLACK} />
                 <div style={{ textAlign: "left" }}>
                   <p className="text-[10px] text-gray-500">Solaire</p>
                   <p className="font-bold text-sm text-black">8.2 kWh</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#ffffff] shadow-md rounded-2xl border border-gray-100 w-full">
                 <Zap size={18} color={BLACK} />
                 <div style={{ textAlign: "left" }}>
                   <p className="text-[10px] text-gray-500">Énergie</p>
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