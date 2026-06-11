import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VoiceControlButton from '../components/VoiceControlButton';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

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


const { translations } = require("../translations");

const BarChart = ({ data, language }) => {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="relative h-52 pt-2 px-8">
      <div className={`absolute inset-0 flex flex-col justify-between pointer-events-none pb-[40px] ${language === "العربية" ? "ps-2" : "px-2"}`}>
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className={`text-[10px] text-[#b0b8c4] ${language === "العربية" ? "-mr-7" : "-ml-7"}`}>18</span>
        </div>
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className={`text-[10px] text-[#b0b8c4] ${language === "العربية" ? "-mr-7" : "-ml-7"}`}>12</span>
        </div>
        <div className="border-b border-[#f0f2f5] w-full h-full flex items-start">
          <span className={`text-[10px] text-[#b0b8c4] ${language === "العربية" ? "-mr-7" : "-ml-7"}`}>6</span>
        </div>
        <div className="w-full flex items-start" style={{ flex: '0 0 1px', background: '#f0f2f5' }}>
          <span className={`text-[10px] text-[#b0b8c4] ${language === "العربية" ? "-mr-7" : "-ml-7"}`}>0</span>
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
  const [language, setLanguage] = useState("Français");
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

   
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // === API Fetch: Reports Summary ===
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const simulate = new URLSearchParams(window.location.search).get('simulate');
        const url = simulate === 'true'
          ? 'http://localhost:5000/api/reports/summary?simulate=true'
          : 'http://localhost:5000/api/reports/summary';
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReportData(res.data);
      } catch (err) {
        console.error('Failed to fetch report data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const t = translations[language] || translations["Français"];

  
  const labelsJourMapped = t.labelsJour || ['Lun', 'Mar', 'Merc', 'Jeud', 'Vend', 'Sam', 'Dem'];
  
  const dayData = (reportData?.chart?.daily?.labels || labelsJourMapped).map((label, i) => ({
    label,
    val: reportData?.chart?.daily?.values?.[i] ?? [75, 55, 50, 35, 30, 95, 35][i],
    active: i === (reportData?.chart?.daily?.values || [75, 55, 50, 35, 30, 95, 35]).indexOf(Math.max(...(reportData?.chart?.daily?.values || [75, 55, 50, 35, 30, 95, 35])))
  }));

  const weekRawValues = reportData?.chart?.weekly?.values || [55, 80, 63, 72];
  const weekRawLabels = reportData?.chart?.weekly?.labels || ['S1', 'S2', 'S3', 'S4'];
  const weekMaxIdx = weekRawValues.indexOf(Math.max(...weekRawValues));
  const weekData = language === "العربية" ?
    weekRawLabels.map((l, i) => ({ label: `أسبوع ${i + 1}`, val: weekRawValues[i], active: i === weekMaxIdx })) :
    language === "English" ?
    weekRawLabels.map((l, i) => ({ label: `W${i + 1}`, val: weekRawValues[i], active: i === weekMaxIdx })) :
    weekRawLabels.map((l, i) => ({ label: l, val: weekRawValues[i], active: i === weekMaxIdx }));

  // ============ EXPORT EXCEL METARJAM ============
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const isAr = language === "العربية";
    const isEn = language === "English";

    const headersKPI = isAr ? ['المؤشر', 'القيمة', 'ملاحظة'] : isEn ? ['Indicator', 'Value', 'Note'] : ['Indicateur', 'Valeur', 'Note'];
    const kpiData = [
      headersKPI,
      [isAr ? 'إجمالي الاستهلاك' : isEn ? 'Total Consumption' : 'Consommation Totale', `${reportData?.kpis?.totalConsumption?.value ?? 482.5} kWh`, isAr ? `السابق: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh` : isEn ? `Previous: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh` : `Précédent: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh`],
      [isAr ? 'الأجهزة النشطة' : isEn ? 'Active Devices' : 'Dispositifs Actifs', `${reportData?.kpis?.activeDevices?.active ?? 12} / ${reportData?.kpis?.activeDevices?.total ?? 24}`, isAr ? `ذروة النشاط عند ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}` : isEn ? `Peak activity at ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}` : `Pic d'activité à ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}`],
      [isAr ? 'معدل وقت الاستخدام' : isEn ? 'Average Usage Time' : "Temps d'utilisation moyen", reportData?.kpis?.avgUsageTime?.formatted ?? '6h 42m', isAr ? 'لكل جهاز / يوم' : isEn ? 'Per device / day' : 'Par appareil / jour'],
      [isAr ? 'الأكثر استخداماً' : isEn ? 'Most Used' : 'Plus utilisé', reportData?.kpis?.mostUsedDevice?.name ?? (isAr ? 'المكيف' : isEn ? 'Air Cond.' : 'Air Cond.'), isAr ? `مستخدم منذ ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5} ساعة اليوم` : isEn ? `Used for ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}h today` : `Utilisé depuis ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}h aujourd'hui`],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), isAr ? 'المؤشرات الرئيسية' : 'KPIs');

    const daySheet = [
      [isAr ? 'اليوم' : isEn ? 'Day' : 'Commune', isAr ? 'الاستهلاك (kWh)' : 'Consommation (kWh)'],
      ...dayData.map(d => [d.label, d.val])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(daySheet), isAr ? 'استهلاك الأيام' : 'Consommation Jour');

    const weekSheet = [
      [isAr ? 'الأسبوع' : isEn ? 'Week' : 'Semaine', isAr ? 'الاستهلاك (kWh)' : 'Consommation (kWh)'],
      ...weekData.map(w => [w.label, w.val])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(weekSheet), isAr ? 'استهلاك الأسابيع' : 'Consommation Semaine');

    const devicesSheet = [
      [isAr ? 'الجهاز' : isEn ? 'Device' : 'Appareil', isAr ? 'النسبة (%)' : 'Pourcentage (%)'],
      [isAr ? 'مكيف الهواء' : isEn ? 'Air Conditioning' : 'Air conditionné', reportData?.deviceBreakdown?.[0]?.percentage ?? 25],
      [isAr ? 'الثلاجة' : isEn ? 'Refrigerator' : 'Refrigerator', reportData?.deviceBreakdown?.[1]?.percentage ?? 47],
      [isAr ? 'الفرن الكهربائي' : isEn ? 'Electric Oven' : 'Four électrique', reportData?.deviceBreakdown?.[2]?.percentage ?? 63],
      [isAr ? 'الإضاءة الذكية' : isEn ? 'Smart Lighting' : 'Eclairage intelligent', reportData?.deviceBreakdown?.[3]?.percentage ?? 20],
      [isAr ? 'السينما المنزلية' : isEn ? 'Home Theatre' : 'Home Theatre', reportData?.deviceBreakdown?.[4]?.percentage ?? 35],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(devicesSheet), isAr ? 'الأجهزة' : 'Appareils');

    const statsSheet = [
      [isAr ? 'الإحصائيات' : isEn ? 'Statistic' : 'Statistique', isAr ? 'القيمة' : 'Valeur'],
      [isAr ? 'إجمالي الوفورات' : isEn ? 'Total Savings' : 'Économies totales', `$${(reportData?.weeklyStats?.savings ?? 14.20).toFixed(2)}`],
      [isAr ? 'مؤشر الكفاءة' : isEn ? 'Efficiency Score' : "Score d'efficacité", `${reportData?.weeklyStats?.efficiencyScore ?? 88}/100`],
      [isAr ? 'أوقات الذروة' : isEn ? 'Peak Usage' : "Pics d'utilisation", reportData?.weeklyStats?.peakUsage?.formatted ?? (isAr ? 'الإثنين، 18:45' : isEn ? 'Monday, 18:45' : 'Lundi, 18:45')],
      [isAr ? 'البصمة الكربونية' : isEn ? 'Carbon Footprint' : 'Carbon Footprint', `${reportData?.weeklyStats?.carbonFootprint?.value ?? 12}kg CO2`],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsSheet), isAr ? 'الإحصائيات العامة' : 'Statistiques');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), isAr ? 'تقرير_المنزل_الذكي.xlsx' : 'rapport_smarthome.xlsx');
  };

  // ============ EXPORT PDF METARJAM — RAPPORT MKTOB ============
  const handleExportFullPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    let y = 18;

    const isAr = language === "العربية";
    const isEn = language === "English";

    const addTitle = (text) => {
      pdf.setFillColor(104, 117, 134);
      pdf.roundedRect(14, y - 5, W - 28, 10, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, isAr ? W - 18 : 18, y + 1.5, { align: isAr ? 'right' : 'left' });
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
      pdf.text(label, isAr ? W - 18 : 18, y + 1, { align: isAr ? 'right' : 'left' });
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 46);
      pdf.text(value, isAr ? 18 : W - 18, y + 1, { align: isAr ? 'left' : 'right' });
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
    pdf.text(isAr ? 'التقارير والتحليلات — المنزل الذكي' : isEn ? 'Reports & Analytics — SmartHome' : 'Reports & Analytics — SmartHome', W / 2, 9, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${isAr ? 'تم الاستخراج في' : 'Généré le'} : ${new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}`, isAr ? 14 : W - 14, 9, { align: isAr ? 'left' : 'right' });
    pdf.setTextColor(30, 30, 46);
    y = 24;

    // ── KPIs ──
    addTitle(isAr ? '📊 المؤشرات الرئيسية' : '📊  Indicateurs Clés (KPIs)');
    addRow(isAr ? 'إجمالي الاستهلاك' : isEn ? 'Total Consumption' : 'Consommation Totale', `${reportData?.kpis?.totalConsumption?.value ?? 482.5} kWh`, false);
    addRow(isAr ? 'الاستهلاك السابق' : isEn ? 'Previous' : 'Précédent', `${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh`, true);
    addRow(isAr ? 'الأجهزة النشطة' : isEn ? 'Active Devices' : 'Dispositifs Actifs', `${reportData?.kpis?.activeDevices?.active ?? 12} / ${reportData?.kpis?.activeDevices?.total ?? 24}`, false);
    addRow(isAr ? 'وقت الذروة' : isEn ? 'Peak activity' : "Pic d'activité", reportData?.kpis?.activeDevices?.peakHour ?? '19:00', true);
    addRow(isAr ? 'معدل وقت الاستخدام' : isEn ? 'Average usage time' : "Temps d'utilisation moyen", isAr ? `${reportData?.kpis?.avgUsageTime?.formatted ?? '6س 42د'} لكل جهاز يومياً` : `${reportData?.kpis?.avgUsageTime?.formatted ?? '6h 42m'} / appareil / jour`, false);
    addRow(isAr ? 'الجهاز الأكثر استهلاكاً' : isEn ? 'Most used device' : 'Appareil le plus utilisé', isAr ? `${reportData?.kpis?.mostUsedDevice?.name ?? 'المكيف'} - ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}س اليوم` : `${reportData?.kpis?.mostUsedDevice?.name ?? 'Air Cond.'} — ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}h aujourd'hui`, true);
    addSectionGap(); checkPage();

    // ── CONSOMMATION JOURNALIERE ──
    addTitle(isAr ? '📅 الاستهلاك اليومي (kWh)' : '📅  Consommation Journalière (kWh)');
    dayData.forEach((d, i) => addRow(d.label, `${d.val} kWh`, i % 2 === 0));
    addSectionGap(); checkPage();

    // ── CONSOMMATION HEBDO ──
    addTitle(isAr ? '📆 الاستهلاك الأسبوعي (kWh)' : '📆  Consommation Hebdomadaire (kWh)');
    weekData.forEach((w, i) => addRow(w.label, `${w.val} kWh`, i % 2 === 0));
    addSectionGap(); checkPage();

    // ── STATISTIQUES HEBDO ──
    addTitle(isAr ? '📈 الإحصائيات الأسبوعية' : '📈  Statistiques Hebdomadaires');
    addRow(isAr ? 'إجمالي الوفورات في الفواتير' : 'Économies totales sur les factures', `$${(reportData?.weeklyStats?.savings ?? 14.20).toFixed(2)}`, false);
    addRow(isAr ? 'مؤشر كفاءة الطاقة' : "Score d'efficacité", `${reportData?.weeklyStats?.efficiencyScore ?? 88} / 100`, true);
    addRow(isAr ? 'ذروة الاستخدام المكتشفة' : "Pic d'utilisation", reportData?.weeklyStats?.peakUsage?.formatted ?? (isAr ? 'الإثنين، 18:45' : 'Lundi, 18:45'), false);
    addRow(isAr ? 'البصمة الكربونية للمنزل' : 'Carbon Footprint', `${reportData?.weeklyStats?.carbonFootprint?.value ?? 12} kg CO2`, true);
    addSectionGap(); checkPage();

    // ── APPAREILS ──
    addTitle(isAr ? '🔌 توزيع استهلاك الأجهزة' : '🔌  Répartition par Appareil');
    const bd = reportData?.deviceBreakdown || [];
    const devList = [
      [isAr ? "مكيف الهواء" : isEn ? "Air Conditioning" : "Air conditionné", `${bd[0]?.percentage ?? 25}%`],
      [isAr ? "الثلاجة" : isEn ? "Refrigerator" : "Refrigerator", `${bd[1]?.percentage ?? 47}%`],
      [isAr ? "الفرن الكهربائي" : isEn ? "Electric Oven" : "Four électrique", `${bd[2]?.percentage ?? 63}%`],
      [isAr ? "الإضاءة الذكية" : isEn ? "Smart Lighting" : "Eclairage intelligent", `${bd[3]?.percentage ?? 20}%`],
      [isAr ? "السينما المنزلية" : isEn ? "Home Theatre" : "Home Theatre", `${bd[4]?.percentage ?? 35}%`],
    ];
    devList.forEach(([n, p], i) => addRow(n, p, i % 2 === 0));

    // ── FOOTER ──
    const pages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(180, 184, 196);
      pdf.text(`SmartHome Management  •  Page ${i} / ${pages}`, W / 2, 292, { align: 'center' });
    }

    pdf.save(isAr ? 'تقرير_المنزل_الذككي.pdf' : 'rapport_smarthome.pdf');
  };

  // ============ EXPORT PDF — STATS HEBDO METARJAM ============
  const handleExportStatsPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const W = pdf.internal.pageSize.getWidth();
    let y = 18;

    const isAr = language === "العربية";

    // ── HEADER ──
    pdf.setFillColor(26, 29, 46);
    pdf.rect(0, 0, W, 14, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(isAr ? 'الإحصائيات الأسبوعية — المنزل الذكي' : 'Statistiques Hebdomadaires — SmartHome', W / 2, 9, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${isAr ? 'تم الاستخراج في' : 'Généré le'} : ${new Date().toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR')}`, isAr ? 14 : W - 14, 9, { align: isAr ? 'left' : 'right' });
    pdf.setTextColor(30, 30, 46);
    y = 28;

    // ── SOUS-TITRE ──
    pdf.setFontSize(9);
    pdf.setTextColor(136, 146, 164);
    pdf.setFont('helvetica', 'italic');
    pdf.text(isAr ? 'الأداء مقارنة بالأسبوع الماضي' : 'Performance vs la semaine dernière', isAr ? W - 14 : 14, y, { align: isAr ? 'right' : 'left' });
    y += 12;

    // ── ECONOMIES CARD ──
    pdf.setFillColor(248, 250, 255);
    pdf.roundedRect(14, y, W - 28, 24, 3, 3, 'F');
    pdf.setDrawColor(238, 242, 255);
    pdf.roundedRect(14, y, W - 28, 24, 3, 3, 'S');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(104, 117, 134);
    pdf.text(isAr ? 'إجمالي الوفورات في الفواتير' : 'Économies totales sur les factures', isAr ? W - 20 : 20, y + 8, { align: isAr ? 'right' : 'left' });
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 46);
    pdf.text(`$${(reportData?.weeklyStats?.savings ?? 14.20).toFixed(2)}`, isAr ? W - 20 : 20, y + 19, { align: isAr ? 'right' : 'left' });
    y += 32;

    // ── TITRE SECTION ──
    pdf.setFillColor(104, 117, 134);
    pdf.roundedRect(14, y, W - 28, 10, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(isAr ? '📈 تفاصيل الإحصائيات الفنية' : '📈  Détail des Statistiques', isAr ? W - 18 : 18, y + 6.5, { align: isAr ? 'right' : 'left' });
    pdf.setTextColor(30, 30, 46);
    y += 14;

    // ── ROWS ──
    const rows = [
      [isAr ? "مؤشر الكفاءة" : "Score d'efficacité", `${reportData?.weeklyStats?.efficiencyScore ?? 88} / 100`],
      [isAr ? "ذروة الاستخدام" : "Pic d'utilisation", reportData?.weeklyStats?.peakUsage?.formatted ?? (isAr ? 'الإثنين، 18:45' : 'Lundi, 18:45')],
      [isAr ? 'البصمة الكربونية البيئية' : 'Carbon Footprint', `${reportData?.weeklyStats?.carbonFootprint?.value ?? 12} kg CO2`],
    ];
    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) pdf.setFillColor(248, 249, 251);
      else pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, y, W - 28, 10, 1, 1, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(136, 146, 164);
      pdf.text(label, isAr ? W - 18 : 18, y + 6.5, { align: isAr ? 'right' : 'left' });
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 30, 46);
      pdf.text(value, isAr ? 18 : W - 18, y + 6.5, { align: isAr ? 'left' : 'right' });
      y += 11;
    });

    // ── FOOTER ──
    pdf.setFontSize(7);
    pdf.setTextColor(180, 184, 196);
    pdf.text('SmartHome Management  •  Page 1 / 1', W / 2, 292, { align: 'center' });

    pdf.save(isAr ? 'الإحصائيات_الأسبوعية.pdf' : 'statistiques_hebdomadaires.pdf');
  };

  return (
    <div className="bg-[#f0f2f7] p-6 rounded-[32px] w-full min-h-screen font-sans" dir={language === "العربية" ? "rtl" : "ltr"}>

      {loading && (
        <div className="fixed inset-0 bg-white/60 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#687586] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-[#1a1d2e]">{language === "العربية" ? "جاري التحميل..." : "Loading report..."}</span>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] tracking-tight mb-4">
            {language === "العربية" ? "التقارير والتحليلات" : language === "English" ? "Reports & Analytics" : "Reports & Analytics"}
          </h1>
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              {language === "العربية" ? "تقرير إكسل" : language === "English" ? "Excel Report" : "Rapport Exel"}
            </button>
            <button onClick={handleExportFullPDF} className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-[#687586] text-black hover:opacity-90 transition shadow-sm">
              {language === "العربية" ? "تقرير PDF" : language === "English" ? "PDF Report" : "Rapport PDF"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <VoiceControlButton />
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Consommation_Total, trend: (reportData?.kpis?.totalConsumption?.trend ?? -5.8) >= 0 ? tendance_haussière : tendance_baissière, percent: `${Math.abs(reportData?.kpis?.totalConsumption?.trend ?? 5.8)}%`, label: language === "العربية" ? "إجمالي الاستهلاك" : language === "English" ? "Total Consumption" : "Consommation Totale", value: `${reportData?.kpis?.totalConsumption?.value ?? 482.5} kWh`, sub: language === "العربية" ? `السابق: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh` : language === "English" ? `Previous: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh` : `Précédent: ${reportData?.kpis?.totalConsumption?.previous ?? 512.1} kWh` },
          { icon: Dispositifs_Actifs, label: language === "العربية" ? "الأجهزة النشطة" : language === "English" ? "Active Devices" : "Dispositifs Actifs", value: `${reportData?.kpis?.activeDevices?.active ?? 12} / ${reportData?.kpis?.activeDevices?.total ?? 24}`, sub: language === "العربية" ? `ذروة النشاط ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}` : language === "English" ? `Peak activity at ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}` : `Pic d'activité à ${reportData?.kpis?.activeDevices?.peakHour ?? '19:00'}` },
          { icon: Temps_d_utilisation_moyen, trend: tendance_baissière, percent: '5.8%', label: language === "العربية" ? "معدل وقت الاستخدام" : language === "English" ? "Average Usage Time" : "Temps d'utilisation moyen", value: reportData?.kpis?.avgUsageTime?.formatted ?? '6h 42m', sub: language === "العربية" ? "لكل جهاز / يوم" : language === "English" ? "Per device / day" : "Par appareil / jour" },
          { icon: Air, label: language === "العربية" ? "الأكثر استخداماً" : language === "English" ? "Most Used" : "Plus utilisé", value: reportData?.kpis?.mostUsedDevice?.name ?? (language === "العربية" ? "المكيف" : "Air Cond."), sub: language === "العربية" ? `نشط منذ ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}س اليوم` : language === "English" ? `Used for ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}h today` : `Utilisé depuis ${reportData?.kpis?.mostUsedDevice?.hoursToday ?? 12.5}h aujourd'hui` },
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-6">
        <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#1a1d2e]">
                {language === "العربية" ? "استهلاك الطاقة بمرور الوقت" : language === "English" ? "Energy Consumption Over Time" : "Consommation d'énergie au fil du temps"}
              </h3>
              <p className="text-[11px] text-[#8892a4] mt-0.5">
                {language === "العربية" ? "التوزيع اليومي لاستخدام الكهرباء" : language === "English" ? "Daily breakdown of electricity usage" : "Répartition quotidienne de l'utilisation d'électricité"}
              </p>
            </div>
            <div className="flex bg-[#687586] p-1 rounded-lg self-end sm:self-start">
              <span
                onClick={() => setView('jour')}
                className={`px-3 py-1 text-[10px] font-bold cursor-pointer rounded-md transition ${view === 'jour' ? 'bg-white text-[#1a1d2e] shadow-sm' : 'text-black'}`}
              >
                {language === "العربية" ? "كل يوم" : language === "English" ? "every day" : "chaque jour"}
              </span>
              <span
                onClick={() => setView('semaine')}
                className={`px-3 py-1 text-[10px] font-bold cursor-pointer rounded-md transition ${view === 'semaine' ? 'bg-white text-[#1a1d2e] shadow-sm' : 'text-black'}`}
              >
                {language === "العربية" ? "كل أسبوع" : language === "English" ? "every week" : "chaque semaine"}
              </span>
            </div>
          </div>
          <BarChart data={view === 'jour' ? dayData : weekData} language={language} />
        </div>

        {/* STATS HEBDO */}
        <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1d2e] mb-1">
            {language === "العربية" ? "الإحصائيات الأسبوعية" : language === "English" ? "Weekly Statistics" : "Statistiques Hebdomadaires"}
          </h3>
          <p className="text-[11px] text-[#8892a4] mb-4">
            {language === "العربية" ? "الأداء مقارنة بالأسبوع الماضي" : language === "English" ? "Performance vs last week" : "Performance vs la semaine dernière"}
          </p>
          <div className="bg-[#f8faff] rounded-2xl p-4 mb-4 border border-[#eef2ff] relative overflow-hidden">
            <p className="text-[10px] text-[#687586] font-bold mb-1">
              {language === "العربية" ? "إجمالي الوفورات في الفواتير" : language === "English" ? "Total savings on bills" : "Économies totales sur les factures"}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#1a1d2e]">${reportData?.weeklyStats?.savings?.toFixed(2) ?? '14.20'}</span>
              <div className="bg-gray-200 p-1 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="3"><path d="M7 7l10 10M17 7v10H7" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">{language === "العربية" ? "مؤشر الكفاءة" : language === "English" ? "Efficiency Score" : "Score d'efficacité"}</span>
              <span className="font-bold">{reportData?.weeklyStats?.efficiencyScore ?? 88}/100</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">{language === "العربية" ? "ذروة الاستخدام" : language === "English" ? "Peak Usage" : "Pics d'utilisation"}</span>
              <span className="font-bold">{reportData?.weeklyStats?.peakUsage?.formatted ?? (language === "العربية" ? "الإثنين، 18:45" : language === "English" ? "Monday, 18:45" : "Lundi, 18:45")}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">{language === "العربية" ? "البصمة الكربونية" : language === "English" ? "Carbon Footprint" : "Carbon Footprint"}</span>
              <span className="font-bold">{reportData?.weeklyStats?.carbonFootprint?.value ?? 12}kg CO2</span>
            </div>
          </div>
          <button onClick={handleExportStatsPDF} className="w-full mt-6 bg-[#687586] text-black rounded-xl py-2.5 text-xs font-bold hover:bg-[#545659] transition shadow-md">
            {language === "العربية" ? "تقرير كامل PDF" : language === "English" ? "Full PDF Report" : "Rapport complet PDF"}
          </button>
        </div>
      </div>

      {/* DEVICES */}
      <div className="bg-white rounded-[24px] p-6 border border-[#e8ecf4] shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-bold text-[#1a1d2e]">
            {language === "العربية" ? "توزيع استهلاك الأجهزة للملفات الذكية" : language === "English" ? "Device Usage Breakdown" : "Répartition de l'utilisation des appareils"}
          </h3>
        </div>
        <p className="text-[11px] text-[#8892a4] mb-6">
          {language === "العربية" ? "حصة الطاقة حسب الأجهزة المنزلية الرئيسية" : language === "English" ? "Energy share by main household appliance" : "Part d'énergie par appareil ménager principal"}
        </p>

        <div className="space-y-5">
          {(() => {
          const defaults = [
            { icon: Air_conditionné, nameKey: 'air' },
            { icon: refrigerator, nameKey: 'frigo' },
            { icon: Four_électrique, nameKey: 'four' },
            { icon: Eclairage_intelligent, nameKey: 'lum' },
            { icon: Home_Theatre, nameKey: 'tv' },
          ];
          const apiBreakdown = reportData?.deviceBreakdown || [];
          return defaults.map((d, i) => ({
            ...d,
            pct: apiBreakdown[i]?.percentage ?? [25, 47, 63, 20, 35][i]
          }));
        })().map((d, i) => {
            
            let deviceName = d.name;
            if (d.nameKey === 'air') deviceName = language === "العربية" ? "مكيف الهواء" : language === "English" ? "Air Conditioning" : "Air conditionné";
            if (d.nameKey === 'frigo') deviceName = language === "العربية" ? "الثلاجة" : language === "English" ? "Refrigerator" : "Refrigerator";
            if (d.nameKey === 'four') deviceName = language === "العربية" ? "الفرن الكهربائي" : language === "English" ? "Electric Oven" : "Four électrique";
            if (d.nameKey === 'lum') deviceName = language === "العربية" ? "الإضاءة الذكية" : language === "English" ? "Smart Lighting" : "Eclairage intelligent";
            if (d.nameKey === 'tv') deviceName = language === "العربية" ? "السينما المنزلية" : language === "English" ? "Home Theatre" : "Home Theatre";

            return (
              <div key={i}>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-11 h-11 flex items-center justify-center bg-[#D9D9D9] rounded-lg">
                    <img src={d.icon} alt={deviceName} className="w-7 h-7 object-contain" />
                  </div>
                  <span className="flex-1 text-[13px] font-bold text-[#1a1d2e]">{deviceName}</span>
                  <span className="text-[13px] font-bold text-[#1a1d2e]">{d.pct}%</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ 
                    background: '#8DB0C6', 
                    marginRight: language === "العربية" ? '56px' : '0px',
                    marginLeft: language === "العربية" ? '0px' : '56px' 
                  }}
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
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Rapports;