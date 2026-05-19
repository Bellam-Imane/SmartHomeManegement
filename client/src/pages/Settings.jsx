import { useState, useEffect, useRef } from "react";
import { Bell, Globe, Moon, Sun, AlertTriangle, Check, Camera } from "lucide-react";
import VoiceControlButton from "../components/VoiceControlButton";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const accent = "#252C34";

  const [profile, setProfile] = useState({
    name: "",
    prenom: "",
    email: "",
    phone: "",
    photo: "",
  });

  const [saved, setSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("Français");
  const [langOpen, setLangOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    security: { mobile: true, email: true, desktop: true },
    system: { mobile: true, email: true, desktop: false },
    energy: { mobile: true, email: false, desktop: false },
    device: { mobile: true, email: true, desktop: false },
  });

   
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data) {
          setProfile({
            name: res.data.nom || "",
            prenom: res.data.prenom || "",
            email: res.data.email || "",
            phone: res.data.telephone || "",
            photo: res.data.photo || "/assets/user1.jpg",
          });
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchProfile();
  }, []);

  
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        nom: profile.name,
        prenom: profile.prenom,
        email: profile.email,
        telephone: profile.phone,
        photo: profile.photo,
      };

      const res = await axios.put('http://localhost:5000/api/users/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        
        
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Erreur save profile", err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

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

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Paramètres</h1>
        <div className="flex items-center gap-6">
          
          <VoiceControlButton />  
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-1 text-[#111827]">Profile</h2>
        <p className="text-xs mb-5 text-[#6b7280]">Gérez votre identité personnelle et vos identifiants d'accès.</p>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-5">
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" 
                     onError={(e) => e.currentTarget.src = "https://ui-avatars.com/api/?name=User"} />
              </div>
              <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100"><Camera size={16} /></button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-xs font-semibold mb-1">Nom</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Prénom</label>
              <input value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Email</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Téléphone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2" style={{ background: accent }}>
            {saved ? <><Check size={16} /> Enregistré</> : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-4 text-[#111827]">Sécurité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Double authentification</p>
              <p className="text-xs text-[#6b7280]">Protéger votre compte.</p>
            </div>
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </div>
          <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Contact d'urgence" className="px-4 py-2 text-sm border rounded-xl" />
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-4">Notifications</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left pb-4">Type</th>
                <th className="text-center pb-4">Mobile</th>
                <th className="text-center pb-4">Email</th>
              </tr>
            </thead>
            <tbody>
              {notifRows.map((row) => (
                <tr key={row.key} className="border-b border-gray-50">
                  <td className="py-4"><p className="font-bold">{row.label}</p><p className="text-[10px] text-gray-400">{row.desc}</p></td>
                  <td className="py-4 text-center"><Toggle checked={notifications[row.key].mobile} onChange={() => toggleNotif(row.key, "mobile")} /></td>
                  <td className="py-4 text-center"><Toggle checked={notifications[row.key].email} onChange={() => toggleNotif(row.key, "email")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Display & Language */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold mb-4">Affichage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="w-full flex items-center justify-between px-4 py-2 border rounded-xl">
              <span>{language}</span><Globe size={14} />
            </button>
            {langOpen && (
              <div className="absolute w-full bg-white border rounded-xl mt-1 shadow-lg z-20">
                {languages.map(l => <button key={l} onClick={() => {setLanguage(l); setLangOpen(false)}} className="w-full text-left px-4 py-2 hover:bg-gray-50">{l}</button>)}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border rounded-xl p-2">
            <span className="text-sm font-semibold">{darkMode ? "Mode sombre" : "Mode clair"}</span>
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}