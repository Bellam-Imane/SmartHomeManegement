import { useState } from "react";
import {
  Bell,
  User,
  Globe,
  Moon,
  Sun,
  AlertTriangle,
  Check,
} from "lucide-react";


// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        background: checked ? "#1e1e2d" : "#e2e4e9",
        transition: "background 0.25s",
      }}
      className="relative inline-flex items-center w-14 h-7 rounded-full focus:outline-none flex-shrink-0"
    >
      <span
        style={{
          transform: checked ? "translateX(30px)" : "translateX(3px)",
          transition: "transform 0.25s",
        }}
        className="inline-block w-5 h-5 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function Settings() {
  // Profile
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
  });
  const [saved, setSaved] = useState(false);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("");

  // Display
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("Français");
  const [langOpen, setLangOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    security: { mobile: true,  email: true,  desktop: true  },
    system:   { mobile: true,  email: true,  desktop: false },
    energy:   { mobile: true,  email: false, desktop: false },
    device:   { mobile: true,  email: true,  desktop: false },
  });

  const languages = ["Français", "English", "العربية"];

  const notifRows = [
    { key: "security", label: "Alertes de Sécurité", desc: "Intrusions, détection de fumée ou fuite de gaz." },
    { key: "system", label: "Mises à jour Système", desc: "Nouvelles fonctionnalités et correctifs de sécurité." },
    { key: "energy", label: "Rapports d'Énergie", desc: "Rapports hebdomadaires de votre consommation." },
    { key: "device", label: "État des Appareils", desc: "Statuts liés au fonctionnement d'un appareil." },
  ];

  const toggleNotif = (type, channel) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: { ...prev[type], [channel]: !prev[type][channel] },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const accent = "#252C34";

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#F8FAFC" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">paramètres</h1>
        <div className="flex items-center gap-3">
          
          <button className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <Bell size={18} color="#000" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">2</span>
          </button>
        </div>
      </div>

      {/* ── Profile (SECTION MODIFIÉE) ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-1 text-[#111827]">Profile</h2>
        <p className="text-xs mb-5 text-[#6b7280]">
          Gérez votre identité personnelle et vos identifiants d'accès à l'écosystème domotique
        </p>

        <div className="flex items-start gap-5 mb-5">
          {/* Avatar Area - Juste la photo */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50">
              <img
                src="/assets/user1.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
                // Au cas où l'image ne charge pas, on affiche un fond gris neutre
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af";
                }}
              />
            </div>
            <button className="text-xs font-bold text-[#252C34] hover:underline">
              Changer la photo
            </button>
          </div>

          {/* Inputs Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Nom complet", placeholder: "Entrer votre nom" },
              { key: "email", label: "Email", placeholder: "Entrer votre email" },
              { key: "phone", label: "Téléphone", placeholder: "Entrer votre téléphone" },
              { key: "region", label: "Région", placeholder: "Entrer votre région" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1 text-[#374151]">{label}</label>
                <input
                  value={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-300 text-[#111827]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 text-white"
            style={{ background: accent }}
          >
            {saved ? <><Check size={14} /> Enregistré</> : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* ── Security ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-1 text-[#111827]">Sécurité et Confidentialité</h2>
        <p className="text-xs mb-4 text-[#6b7280]">Gérez la sécurité de votre compte...</p>
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} color="#ef4444" />
            <span className="text-xs font-medium text-[#dc2626]">Votre compte n'est pas encore sécurisé...</span>
          </div>
          <button className="text-xs font-bold text-[#dc2626] hover:opacity-70">Update now</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#111827]">Authentification à deux facteurs</p>
              <p className="text-xs mt-1 text-[#6b7280]">Ajoutez une couche de sécurité...</p>
            </div>
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </div>
          <div>
            <p className="text-sm font-bold mb-1 text-[#111827]">Numéro de contact d'urgence</p>
            <input
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Entrer un numéro"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-300 text-[#111827]"
            />
          </div>
        </div>
      </div>

      {/* ── Notifications ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-1 text-[#111827]">Préférences de Notification</h2>
        <div className="overflow-x-auto mt-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[#374151]">
                <th className="text-left pb-4 font-bold">Type de notification</th>
                <th className="text-center pb-4 font-bold px-6">Mobile Push</th>
                <th className="text-center pb-4 font-bold px-6">E-mail</th>
                <th className="text-center pb-4 font-bold px-6">Desktop</th>
              </tr>
            </thead>
            <tbody>
              {notifRows.map((row) => (
                <tr key={row.key} className="border-b border-gray-50">
                  <td className="py-5 pr-4">
                    <p className="font-bold text-sm text-[#111827]">{row.label}</p>
                    <p className="text-xs mt-0.5 text-[#9ca3af]">{row.desc}</p>
                  </td>
                  <td className="py-5 px-6"><div className="flex justify-center"><Toggle checked={notifications[row.key].mobile} onChange={() => toggleNotif(row.key, "mobile")} /></div></td>
                  <td className="py-5 px-6"><div className="flex justify-center"><Toggle checked={notifications[row.key].email} onChange={() => toggleNotif(row.key, "email")} /></div></td>
                  <td className="py-5 px-6"><div className="flex justify-center"><Toggle checked={notifications[row.key].desktop} onChange={() => toggleNotif(row.key, "desktop")} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Display & Language ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold mb-4 text-[#111827]">Préférences d'affichage et langue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold mb-2 text-[#374151]">Choisir la langue</label>
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-[#252C34] font-semibold">
                <span>{language}</span>
                <Globe size={14} color="#000" />
              </button>
              {langOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => { setLanguage(lang); setLangOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50" style={{ color: language === lang ? accent : "#374151", fontWeight: language === lang ? 700 : 400 }}>{lang}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-[#374151]">Mode sombre</label>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#374151]">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>{darkMode ? "Mode sombre activé" : "Mode clair activé"}</span>
              </div>
              <Toggle checked={darkMode} onChange={setDarkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}