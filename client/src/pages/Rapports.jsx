import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

import user1 from '../assets/profile1.jfif';
import user2 from '../assets/profile2.jfif';
import user3 from '../assets/profile3.jfif';
import Air from '../assets/Air_Cond.png';
import Consommation_Total from '../assets/Consommation_Total.png';
import Dispositifs_Actifs from '../assets/Dispositifs_Actifs.png';
import Temps_d_utilisation_moyen from '../assets/Temps_d_utilisation_moyen.png';
import tendance_baissière from '../assets/tendance_baissière.png';
import tendance_haussière from '../assets/tendance_haussière.png';
import Home_Theatre from '../assets/Home_Theatre.png';
import Eclairage_intelligent from '../assets/Eclairage_intelligent.png';
import Four_électrique from '../assets/Four_électrique.png';
import refrigerator from '../assets/refrigerator.png';
import Air_conditionné from '../assets/Air_conditionné.png';

const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="relative h-52 pt-2 px-8">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-[40px] px-2">
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className="text-[10px] text-[#b0b8c4] -ml-7">18</span>
        </div>
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className="text-[10px] text-[#b0b8c4] -ml-7">12</span>
        </div>
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className="text-[10px] text-[#b0b8c4] -ml-7">6</span>
        </div>
        <div className="w-full flex items-start" style={{ flex: '0 0 1px', background: '#f0f2f5' }}>
          <span className="text-[10px] text-[#b0b8c4] -ml-7">0</span>
        </div>
      </div>

      {/* Bars + Labels */}
      <div className="flex items-end justify-around h-[180px] relative z-10">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className="w-11 transition-all duration-500"
              style={{
                height: `${Math.round((d.val / max) * 160)}px`,
                background: d.active ? '#6d7d93' : '#a3bbcf',
                borderRadius: '8px',
              }}
            />
            <span className="text-[11px] text-[#1a1d2e] font-bold italic">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Rapports = () => {
  const [view, setView] = useState('jour');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const dayData = [
    { label: 'Lun', val: 75 }, { label: 'Mar', val: 55 }, { label: 'Merc', val: 50 },
    { label: 'Jeud', val: 35 }, { label: 'Vend', val: 30 }, { label: 'Sam', val: 95, active: true },
    { label: 'Dem', val: 35 },
  ];

  const weekData = [
    { label: 'S1', val: 55 }, { label: 'S2', val: 80 },
    { label: 'S3', val: 63 }, { label: 'S4', val: 72, active: true },
  ];

  const devices = [
    { icon: '❄️', name: 'Air conditionné', pct: 25 },
    { icon: '🧊', name: 'Refrigerator', pct: 47 },
    { icon: '🍳', name: 'Four électrique', pct: 63 },
    { icon: '💡', name: 'Eclairage intelligent', pct: 20 },
    { icon: '🎬', name: 'Home Theatre', pct: 35 },
  ];

  return (
    <div className="bg-[#f0f2f7] p-6 rounded-[32px] w-full min-h-screen font-sans">

      {/* TOP BAR */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] tracking-tight mb-4">Reports & Analytics</h1>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              Rapport Exel
            </button>
            <button className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              Rapport PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white rounded-[20px] px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-100 cursor-pointer h-[46px]">
            <div className="bg-[#f3f4f6] rounded-full w-8 h-8 flex items-center justify-center">
              <Mic size={16} color="#1a1d2e" />
            </div>
            <span className="text-[13px] font-bold text-[#1a1d2e]">contrôle vocal</span>
            <div className="w-2 h-2 bg-[#22c55e] rounded-full shadow-[0_0_8px_#22c55e]" />
          </div>

          <div className="bg-white p-2 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition border border-gray-100 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-0 right-0 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-[#1a1d2e]">1</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {[user1, user2, user3].map((img, i) => (
                <div key={i} className={`w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-sm ${i !== 0 ? '-ml-3' : ''}`} style={{ zIndex: 10 - i }}>
                  <img src={img} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="text-sm font-bold text-[#1a1d2e]">Alisha H.</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Consommation_Total, trend: tendance_haussière, percent: '5.8%', label: 'Consommation Totale', value: '482.5 kWh', sub: 'Précédent: 512.1 kWh' },
          { icon: Dispositifs_Actifs, label: 'Dispositifs Actifs', value: '12 / 24', sub: "Pic d'activité à 7 PM" },
          { icon: Temps_d_utilisation_moyen, trend: tendance_baissière, percent: '5.8%', label: "Temps d'utilisation moyen", value: '6h 42m', sub: 'Par appareil / jour' },
          { icon: Air, label: 'Plus utilisé', value: 'Air Cond.', sub: "Utilisé depuis 12.5h aujourd'hui" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 border border-[#e8ecf4] hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#f8f9fb] flex items-center justify-center border border-[#f0f2f5]">
                <img src={k.icon} alt={k.label} className="w-6 h-6 object-contain" />
              </div>
              {k.trend && (
                <div className="flex items-center gap-1">
                  <img src={k.trend} alt="trend" className="w-3 h-3" />
                  <span className={`text-[10px] font-bold ${i === 0 ? 'text-[#8892a4]' : 'text-red-500'}`}>{k.percent}</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] text-[#8892a4] font-medium">{k.label}</div>
              <div className="text-xl font-bold text-[#1a1d2e] tracking-tight">{k.value}</div>
              <div className="text-[10px] text-[#b0b8c4] font-medium">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-[1fr_300px] gap-6 mb-6">
        <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#1a1d2e]">Consommation d'énergie au fil du temps</h3>
              <p className="text-[11px] text-[#8892a4] mt-0.5">Répartition quotidienne de l'utilisation d'électricité</p>
            </div>
            <div className="flex bg-[#687586] p-1 rounded-lg">
              <span
                onClick={() => setView('jour')}
                className={`px-3 py-1 text-[10px] font-bold cursor-pointer rounded-md transition ${view === 'jour' ? 'bg-white text-[#1a1d2e] shadow-sm' : 'text-black'}`}
              >
                chaque jour
              </span>
              <span
                onClick={() => setView('semaine')}
                className={`px-3 py-1 text-[10px] font-bold cursor-pointer rounded-md transition ${view === 'semaine' ? 'bg-white text-[#1a1d2e] shadow-sm' : 'text-black'}`}
              >
                chaque semaine
              </span>
            </div>
          </div>
          <BarChart data={view === 'jour' ? dayData : weekData} />
        </div>

        {/* STATS HEBDO */}
        <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1d2e] mb-1">Statistiques Hebdomadaires</h3>
          <p className="text-[11px] text-[#8892a4] mb-4">Performance vs la semaine dernière</p>
          <div className="bg-[#f8faff] rounded-2xl p-4 mb-4 border border-[#eef2ff] relative overflow-hidden">
            <p className="text-[10px] text-[#687586] font-bold mb-1">Économies totales sur les factures</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#1a1d2e]">$14.20</span>
              <div className="bg-gray-200 p-1 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="3"><path d="M7 7l10 10M17 7v10H7" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px]"><span className="text-gray-400">Score d'efficacité</span><span className="font-bold">88/100</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-400">Pics d'utilisation</span><span className="font-bold">Lundi, 18:45</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-gray-400">Carbon Footprint</span><span className="font-bold">12kg CO2</span></div>
          </div>
          <button className="w-full mt-6 bg-[#687586] text-black rounded-xl py-2.5 text-xs font-bold hover:bg-[#545659] transition shadow-md shadow-blue-100">
            Rapport complet PDF
          </button>
        </div>
      </div>

      {/* DEVICES */}
      <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-bold text-[#1a1d2e]">Répartition de l'utilisation des appareils</h3>
        </div>
        <p className="text-[11px] text-[#8892a4] mb-6">Part d'énergie par appareil ménager principal</p>

        <div className="space-y-5">
          {[
            { icon: Air_conditionné, name: 'Air conditionné', pct: 25 },
            { icon: refrigerator, name: 'Refrigerator', pct: 47 },
            { icon: Four_électrique, name: 'Four électrique', pct: 63 },
            { icon: Eclairage_intelligent, name: 'Eclairage intelligent', pct: 20 },
            { icon: Home_Theatre, name: 'Home Theatre', pct: 35 },
          ].map((d, i) => (
            <div key={i}>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-11 h-11 flex items-center justify-center bg-[#D9D9D9] rounded-lg">
                  <img src={d.icon} alt={d.name} className="w-7 h-7 object-contain" />
                </div>
                <span className="flex-1 text-[13px] font-bold text-[#1a1d2e]">{d.name}</span>
                <span className="text-[13px] font-bold text-[#1a1d2e]">{d.pct}%</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: '#8DB0C6', marginLeft: '56px' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: animated ? `${d.pct}%` : '0%',
                    background: '#687586',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Rapports;