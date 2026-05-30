import { useState, useEffect, useRef } from "react";
import { Globe, Check, Camera, Search } from "lucide-react"; // Search 
import VoiceControlButton from "../components/VoiceControlButton";
import Spinner from "../components/Spinner";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { translations } = require("../translations");

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ background: checked ? "#1e1e2d" : "#e2e4e9", transition: "background 0.25s" }}
      className="relative inline-flex items-center w-14 h-7 rounded-full focus:outline-none flex-shrink-0"
    >
      <span
        style={{ transform: checked ? "translateX(30px)" : "translateX(3px)", transition: "transform 0.25s" }}
        className="inline-block w-5 h-5 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const accent = "#252C34";

  const [profile, setProfile] = useState({ name: "", prenom: "", email: "", phone: "", photo: "" });
  const [saved, setSaved] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "Français";
  });
  const [langOpen, setLangOpen] = useState(false);

  // ---------------------------------------
  const [location, setLocation] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncer, setDebouncer] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState([]);
  const [showSpinner, setShowspinner] = useState(false);
  // --------------------------------

  const [notifications, setNotifications] = useState({
    security: { mobile: true, email: true },
    system: { mobile: true, email: true },
    energy: { mobile: true, email: false },
    device: { mobile: true, email: true },
  });

  const t = translations[language] || translations["Français"];



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

          if (res.data.preferences) {
            const prefs = res.data.preferences;
            setTwoFactor(prefs.twoFactor ?? false);
            setEmergencyContact(prefs.emergencyContact || "");
            setDarkMode(prefs.darkMode ?? false);
            const localLang = localStorage.getItem("language");

            if (localLang) {
              setLanguage(localLang);
            } else if (prefs.language) {
              setLanguage(prefs.language);
              localStorage.setItem("language", prefs.language);
            }
            setLocation(prefs.location || {});
            setSearchTerm(prefs.location?.city || "");
            if (prefs.notifications) {
              setNotifications(prefs.notifications);
            }
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      }
    };
    fetchProfile();
  }, []);

  let debounceQuery = ""
  const handleLocationSearch = (query, timeout = .5) => {
    if (debouncer) {
      clearTimeout(debouncer);
    }
    if (!query) return;
    const d = setTimeout(async () => {
      debounceQuery = query
      setShowspinner(true)
      const response = await axios.get(`https://photon.komoot.io/api/?q=${query}&osm_tag=place`);
      setShowspinner(false)
      console.log(query, debounceQuery)
      if (query == debounceQuery) {
        setSuggestions(
          response.data.features.map(item => ({
            city: item.properties.name,
            country: item.properties.country,
            lon: item.geometry.coordinates[0],
            lat: item.geometry.coordinates[1],
          }))
        )
      }
    }, timeout * 1000);
    setDebouncer(d);
  }
  const handleUpdatePreference = async (updatedPrefs) => {
    try {
      const token = localStorage.getItem('token');
      const currentPrefs = { twoFactor, emergencyContact, darkMode, language, notifications, ...updatedPrefs };

      // 1. التغيير الفوري: نسيفيو اللغة فالمتصفح ونعلمو كاع الصفحات فالحيييييين!
      localStorage.setItem("darkMode", currentPrefs.darkMode ? "true" : "false");
      localStorage.setItem("language", currentPrefs.language);
      window.dispatchEvent(new Event("storage"));

      // 2. عاد نصيفطو التحديث للسيرفر فـ الخلفية
      await axios.put('http://localhost:5000/api/users/profile', { preferences: currentPrefs }, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (err) {
      console.error("Erreur auto-save preference", err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        nom: profile.name,
        prenom: profile.prenom,
        email: profile.email,
        telephone: profile.phone,
        photo: profile.photo
      };

      const res = await axios.put('http://localhost:5000/api/users/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        const userData = res.data.user ? res.data.user : res.data;
        localStorage.setItem("user", JSON.stringify(userData));
        window.dispatchEvent(new Event("storage"));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Erreur save profile", err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const languages = ["Français", "English", "العربية"];

  const notifRows = [
    { key: "security", label: t.securityAlerts, desc: t.securityDesc },
    { key: "system", label: t.systemUpdates, desc: t.systemDesc },
    { key: "energy", label: t.energyReports, desc: t.energyDesc },
    { key: "device", label: t.deviceStatus, desc: t.deviceDesc },
  ];

  const toggleNotif = (type, channel) => {
    const updatedNotifs = { ...notifications, [type]: { ...notifications[type], [channel]: !notifications[type][channel] } };
    setNotifications(updatedNotifs);
    handleUpdatePreference({ notifications: updatedNotifs });
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#F8FAFC" }} dir={language === "العربية" ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">{t.settingsTitle}</h1>
        <div className="flex items-center gap-6">
          <VoiceControlButton />
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-1 text-[#111827]">{t.profile}</h2>
        <p className="text-xs mb-5 text-[#6b7280]">{t.profileDesc}</p>

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
              <label className="block text-xs font-semibold mb-1">{t.nom}</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{t.prenom}</label>
              <input value={profile.prenom} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{t.email}</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{t.phone}</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-2 text-sm border rounded-xl" />
            </div>
          </div>
        </div>

        <div className={`flex ${language === "العربية" ? "justify-start" : "justify-end"} pt-4`}>
          <button onClick={handleSaveProfile} className="px-8 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2" style={{ background: accent }}>
            {saved ? <><Check size={16} /> {t.saved}</> : t.save}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-4 text-[#111827]">{t.security}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{t.twoFactor}</p>
              <p className="text-xs text-[#6b7280]">{t.twoFactorDesc}</p>
            </div>
            <Toggle checked={twoFactor} onChange={(val) => { setTwoFactor(val); handleUpdatePreference({ twoFactor: val }); }} />
          </div>
          <input
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            onBlur={(e) => handleUpdatePreference({ emergencyContact: e.target.value })}
            placeholder={t.emergencyContact}
            className="px-4 py-2 text-sm border rounded-xl"
          />
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <h2 className="text-base font-bold mb-4">{t.notifications}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className={`${language === "العربية" ? "text-right" : "text-left"} pb-4`}>{t.notifType}</th>
                <th className="text-center pb-4">{t.notifMobile}</th>
                <th className="text-center pb-4">{t.notifEmail}</th>
              </tr>
            </thead>
            <tbody>
              {notifRows.map((row) => (
                <tr key={row.key} className="border-b border-gray-50">
                  <td className="py-4"><p className="font-bold">{row.label}</p><p className="text-[10px] text-gray-400">{row.desc}</p></td>
                  <td className="py-4 text-center"><Toggle checked={notifications[row.key]?.mobile ?? true} onChange={() => toggleNotif(row.key, "mobile")} /></td>
                  <td className="py-4 text-center"><Toggle checked={notifications[row.key]?.email ?? true} onChange={() => toggleNotif(row.key, "email")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Display & Language + البحث عن المدينة */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold mb-4">{t.display}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="w-full flex items-center justify-between px-4 py-2 border rounded-xl">
              <span>{language}</span><Globe size={14} />
            </button>
            {langOpen && (
              <div className="absolute w-full bg-white border rounded-xl bottom-full mb-1 shadow-lg z-20">
                {languages.map(l => (
                  <button key={l} onClick={() => { setLanguage(l); setLangOpen(false); handleUpdatePreference({ language: l }); }} className={`w-full ${language === "العربية" ? "text-right" : "text-left"} px-4 py-2 hover:bg-gray-50`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between border rounded-xl p-2">
            <span className="text-sm font-semibold">{darkMode ? t.darkMode : t.lightMode}</span>
            <Toggle checked={darkMode} onChange={(val) => { setDarkMode(val); handleUpdatePreference({ darkMode: val }); }} />
          </div>
        </div>

        {/* سيكشن البحث الجديدة (GPS Alternative) */}
        <hr className="my-6 border-gray-50" />
        <h2 className="text-sm font-bold mb-4 text-gray-700">
          {language === "العربية" ? "موقع المدينة (الطقس)" : language === "English" ? "City Location (Weather)" : "Localisation Ville (Météo)"}
        </h2>
        <div className="relative w-full md:w-1/2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handleLocationSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={language === "العربية" ? "ابحث عن مدينتك..." : "Rechercher votre ville..."}
              className="w-full px-10  py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-gray-50"
            />

            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            {/* <svg  className="absolute right-3 top-2.5 text-gray-400 mr-3 size-5 animate-spin" viewBox="0 0 24 24"/> */}
            {showSpinner ?
              <Spinner className="absolute right-3 top-2 h-6 w-6" /> : <div />}

          </div>

          {showSuggestions && searchTerm && (
            <div className="absolute bottom-[calc(100%+5px)] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  onClick={() => {
                    setLocation(suggestion);
                    setSearchTerm(suggestion.city);
                    setShowSuggestions(false);
                    handleUpdatePreference({ location: suggestion });
                  }}
                  className={`w-full px-4 py-2 text-sm hover:bg-gray-50 text-left ${language === "العربية" ? "text-right" : "text-left"}`}
                >
                  {suggestion.city} - {suggestion.country}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showSuggestions && <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />}
    </div>
  );
}