import { useState } from "react";
import {ComposedChart,Bar,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";
import {Zap,Sun,AirVent,Refrigerator,Tv,Lightbulb,Bell,} from "lucide-react";

// Design Tokens 
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

// Data 
const chartData = [
  { month: "Jan", energy: 80, temp: 5 },
  { month: "Fév", energy: 120, temp: 8 },
  { month: "Mar", energy: 150, temp: 12 },
  { month: "Avr", energy: 190, temp: 18 },
  { month: "Mai", energy: 220, temp: 22 },
  { month: "Jun", energy: 280, temp: 28 },
  { month: "Jul", energy: 310, temp: 32 },
  { month: "Aoû", energy: 290, temp: 30 },
  { month: "Sep", energy: 240, temp: 25 },
  { month: "Oct", energy: 180, temp: 18 },
  { month: "Nov", energy: 130, temp: 10 },
  { month: "Déc", energy: 90, temp: 4 },
];

const devices = [
  { name: "AC", Icon: AirVent, kwh: 50, pct: 70, color: COLORS.ac },
  { name: "Frigo", Icon: Refrigerator, kwh: 30, pct: 40, color: COLORS.frigo },
  { name: "TV", Icon: Tv, kwh: 20, pct: 25, color: COLORS.tv },
  { name: "Lumière", Icon: Lightbulb, kwh: 10, pct: 15, color: COLORS.lumiere },
];

// Sub-components 
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

// Main Component 
const Energy = () => {
  const [activeTab, setActiveTab] = useState("Mois");

  return (
    /* Main Layout: Column on mobile, Row on lg screens */
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#F8FAFC] p-4 md:p-6 gap-6 font-sans">
      
      {/* Central Section (Main Content) */}
      <div className="flex-1 flex flex-col gap-6 order-1">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-black">Consommation d'Énergie</h1>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <button className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Bell size={20} color={BLACK} />
            </button>
            <div className="flex items-center gap-2">
              <div style={{ 
                width: "40px", height: "40px", borderRadius: "50%", 
                overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
              }}>
                <img src="/assets/user1.jpg" alt="Alisha H." style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span className="font-bold text-black text-sm">Alisha H.</span>
            </div>
          </div>
        </div>

        {/* Top Cards - Grid responsive (2 cols mobile, 4 cols xl) */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Consommation Actuelle" value="12 kWh"  />
          <StatCard label="Consommation Aujourd'hui" value="12 kWh" />
          <StatCard label="Consommation Mensuelle" value="240 kWh" />
          <StatCard label="Coût Estimé" value="18 $" />
        </div>

        {/* Chart Container - Responsive height */}
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
              <ComposedChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: XMUTED, fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: XMUTED, fontSize: 10}} />
                <Tooltip />
                {/* Bar Size set to 30 for original appearance */}
                <Bar dataKey="energy" fill={COLORS.chart} radius={[6, 6, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="temp" stroke={BLACK} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Devices Section - Responsive Grid */}
        <div>
          <h3 className="font-bold text-black mb-4">Consommation par appareil</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((d) => <DeviceCard key={d.name} d={d} />)}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Full width on mobile, fixed width on lg */}
      <div className="w-full lg:w-[280px] flex flex-col gap-6 order-2 lg:order-2">
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

        {/* Energy Distribution Card */}
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
  );
};

export default Energy;