import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import VoiceControlButton from '../components/VoiceControlButton';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

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
  const navigate = useNavigate();

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

  // ============ EXPORT EXCEL ============
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const kpiData = [
      ['Indicateur', 'Valeur', 'Note'],
      ['Consommation Totale', '482.5 kWh', 'Précédent: 512.1 kWh'],
      ['Dispositifs Actifs', '12 / 24', "Pic d'activité à 7 PM"],
      ["Temps d'utilisation moyen", '6h 42m', 'Par appareil / jour'],
      ['Plus utilisé', 'Air Cond.', "Utilisé depuis 12.5h aujourd'hui"],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), 'KPIs');

    const daySheet = [
      ['Jour', 'Consommation (kWh)'],
      ['Lun', 75], ['Mar', 55], ['Merc', 50],
      ['Jeud', 35], ['Vend', 30], ['Sam', 95], ['Dem', 35],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(daySheet), 'Consommation Jour');

    const weekSheet = [
      ['Semaine', 'Consommation (kWh)'],
      ['S1', 55], ['S2', 80], ['S3', 63], ['S4', 72],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(weekSheet), 'Consommation Semaine');

    const devicesSheet = [
      ['Appareil', 'Pourcentage (%)'],
      ['Air conditionné', 25],
      ['Refrigerator', 47],
      ['Four électrique', 63],
      ['Eclairage intelligent', 20],
      ['Home Theatre', 35],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(devicesSheet), 'Appareils');

    const statsSheet = [
      ['Statistique', 'Valeur'],
      ['Économies totales', '$14.20'],
      ["Score d'efficacité", '88/100'],
      ["Pics d'utilisation", 'Lundi, 18:45'],
      ['Carbon Footprint', '12kg CO2'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsSheet), 'Statistiques');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'rapport_smarthome.xlsx');
  };

  // ============ EXPORT PDF — RAPPORT MKTOB ============
  const handleExportFullPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    let y = 18;

    const addTitle = (text) => {
      pdf.setFillColor(104, 117, 134);
      pdf.roundedRect(14, y - 5, W - 28, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, 18, y + 1.5);
      pdf.setTextColor(30, 30, 46);
      y += 14;
    };

    const addRow = (label, value, shade) => {
      if (shade) pdf.setFillColor(248, 249, 251);
      else pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, y - 4, W - 28, 8, 1, 1, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(136, 146, 164);
      pdf.text(label, 18, y + 1);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 46);
      pdf.text(value, W - 18, y + 1, { align: 'right' });
      y += 9;
    };

    const addSectionGap = () => { y += 6; };

    const checkPage = () => {
      if (y > 270) { pdf.addPage(); y = 18; }
    };

    // ── HEADER ──
    pdf.setFillColor(26, 29, 46);
    pdf.rect(0, 0, W, 14, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Reports & Analytics — SmartHome', W / 2, 9, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, W - 14, 9, { align: 'right' });
    pdf.setTextColor(30, 30, 46);
    y = 24;

    // ── KPIs ──
    addTitle('📊  Indicateurs Clés (KPIs)');
    addRow('Consommation Totale', '482.5 kWh', false);
    addRow('Précédent', '512.1 kWh', true);
    addRow('Dispositifs Actifs', '12 / 24', false);
    addRow("Pic d'activité", '7 PM', true);
    addRow("Temps d'utilisation moyen", '6h 42m / appareil / jour', false);
    addRow('Appareil le plus utilisé', "Air Cond. — 12.5h aujourd'hui", true);
    addSectionGap(); checkPage();

    // ── CONSOMMATION JOURNALIERE ──
    addTitle('📅  Consommation Journalière (kWh)');
    const days = [['Lun',75],['Mar',55],['Merc',50],['Jeud',35],['Vend',30],['Sam',95],['Dem',35]];
    days.forEach(([d, v], i) => addRow(d, `${v} kWh`, i % 2 === 0));
    addSectionGap(); checkPage();

    // ── CONSOMMATION HEBDO ──
    addTitle('📆  Consommation Hebdomadaire (kWh)');
    const weeks = [['Semaine 1',55],['Semaine 2',80],['Semaine 3',63],['Semaine 4',72]];
    weeks.forEach(([s, v], i) => addRow(s, `${v} kWh`, i % 2 === 0));
    addSectionGap(); checkPage();

    // ── STATISTIQUES HEBDO ──
    addTitle('📈  Statistiques Hebdomadaires');
    addRow('Économies totales sur les factures', '$14.20', false);
    addRow("Score d'efficacité", '88 / 100', true);
    addRow("Pic d'utilisation", 'Lundi, 18:45', false);
    addRow('Carbon Footprint', '12 kg CO2', true);
    addSectionGap(); checkPage();

    // ── APPAREILS ──
    addTitle('🔌  Répartition par Appareil');
    const devices = [
      ["Air conditionné", "25%"],
      ["Refrigerator", "47%"],
      ["Four électrique", "63%"],
      ["Eclairage intelligent", "20%"],
      ["Home Theatre", "35%"],
    ];
    devices.forEach(([n, p], i) => addRow(n, p, i % 2 === 0));

    // ── FOOTER ──
    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(180, 184, 196);
      pdf.text(`SmartHome Management  •  Page ${i} / ${pages}`, W / 2, 292, { align: 'center' });
    }

    pdf.save('rapport_smarthome.pdf');
  };

  // ============ EXPORT PDF — STATS HEBDO MKTOBA ============
  const handleExportStatsPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    let y = 18;

    // ── HEADER ──
    pdf.setFillColor(26, 29, 46);
    pdf.rect(0, 0, W, 14, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Statistiques Hebdomadaires — SmartHome', W / 2, 9, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, W - 14, 9, { align: 'right' });
    pdf.setTextColor(30, 30, 46);
    y = 28;

    // ── SOUS-TITRE ──
    pdf.setFontSize(9);
    pdf.setTextColor(136, 146, 164);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Performance vs la semaine dernière', 14, y);
    y += 12;

    // ── ECONOMIES CARD ──
    pdf.setFillColor(248, 250, 255);
    pdf.roundedRect(14, y, W - 28, 24, 3, 3, 'F');
    pdf.setDrawColor(238, 242, 255);
    pdf.roundedRect(14, y, W - 28, 24, 3, 3, 'S');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(104, 117, 134);
    pdf.text('Économies totales sur les factures', 20, y + 8);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 46);
    pdf.text('$14.20', 20, y + 19);
    y += 32;

    // ── TITRE SECTION ──
    pdf.setFillColor(104, 117, 134);
    pdf.roundedRect(14, y, W - 28, 10, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📈  Détail des Statistiques', 18, y + 6.5);
    pdf.setTextColor(30, 30, 46);
    y += 14;

    // ── ROWS ──
    const rows = [
      ["Score d'efficacité", '88 / 100'],
      ["Pic d'utilisation", 'Lundi, 18:45'],
      ['Carbon Footprint', '12 kg CO2'],
    ];
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) pdf.setFillColor(248, 249, 251);
      else pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, y, W - 28, 10, 1, 1, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(136, 146, 164);
      pdf.text(label, 18, y + 6.5);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 46);
      pdf.text(value, W - 18, y + 6.5, { align: 'right' });
      y += 11;
    });

    // ── FOOTER ──
    pdf.setFontSize(7);
    pdf.setTextColor(180, 184, 196);
    pdf.text('SmartHome Management  •  Page 1 / 1', W / 2, 292, { align: 'center' });

    pdf.save('statistiques_hebdomadaires.pdf');
  };

  return (
    <div className="bg-[#f0f2f7] p-6 rounded-[32px] w-full min-h-screen font-sans">

      {/* TOP BAR */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] tracking-tight mb-4">Reports & Analytics</h1>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              Rapport Exel
            </button>
            <button onClick={handleExportFullPDF} className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              Rapport PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">

          {/* ====== VOICE CONTROL BUTTON ====== */}
          <VoiceControlButton />
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

        {/* STATS HEBDO — ref */}
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
          <button onClick={handleExportStatsPDF} className="w-full mt-6 bg-[#687586] text-black rounded-xl py-2.5 text-xs font-bold hover:bg-[#545659] transition shadow-md shadow-blue-100">
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