import { useState, useEffect, useRef } from "react";
import { Bell, Mic, Pencil, Trash2, Lock, Lightbulb, Thermometer, Video, ShieldCheck, User, Users, UserPlus, RefreshCw, Ban, CheckCircle } from "lucide-react";
import VoiceControlButton from "../components/VoiceControlButton";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from 'qrcode.react'; 

const { translations } = require("../translations");

// ─── COMPONENT: Toggle Switch ────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? "bg-gray-900" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── COMPONENT: Badge ────────────────────────────────────────────────────────
function Badge({ label }) {
  return (
    <span className="mx-2 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}

// ─── COMPONENT: Status Dot ───────────────────────────────────────────────────
function StatusDot({ online, status }) {
  if (status === "BLOCKED") {
    return <span className="mx-1.5 inline-block h-2 w-2 rounded-full bg-red-500" title="Bloqué" />;
  }
  return (
    <span
      className={`mx-1.5 inline-block h-2 w-2 rounded-full ${
        online ? "bg-green-500" : "bg-gray-400"
      }`}
    />
  );
}

// ─── COMPONENT: Avatar ───────────────────────────────────────────────────────
function Avatar({ src, name, bg, color }) {
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold overflow-hidden shadow-sm border border-gray-100"
      style={{ backgroundColor: bg || "#BFDBFE", color: color || "#1E40AF" }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name ? name[0].toUpperCase() : "U"
      )}
    </div>
  );
}

// ─── COMPONENT: Member Card ──────────────────────────────────────────────────
function MemberCard({ member, t, onDelete, onEdit }) {
  const getTranslatedRole = (role) => {
    if (!role) return t.roles.membre.label;
    if (role.toLowerCase().includes("admin")) return t.roles.admin.label;
    if (role.toLowerCase().includes("mem") || role.toLowerCase().includes("عضو")) return t.roles.membre.label;
    return t.roles.invite.label;
  };

  const name = member.profile ? `${member.profile.prenom} ${member.profile.nom}` : member.email;
  const image = member.profile?.photo || null;
  const devicesCount = member.appareilsAutorises ? member.appareilsAutorises.length : 0;
  const isBlocked = member.status === "BLOCKED";

  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-white px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5 ${isBlocked ? "opacity-60 border border-red-100 bg-red-50/10" : ""}`}
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-4">
        <Avatar src={image} name={name} />
        <div>
          <div className="flex items-center text-sm font-semibold text-gray-900">
            {name}
            <Badge label={getTranslatedRole(member.roleType)} />
            {isBlocked && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold">Bloqué</span>}
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <StatusDot online={member.isOnline} status={member.status} />
            {isBlocked ? "Compte Gelé" : (member.isOnline ? t.online : t.offline)}
            &nbsp;•&nbsp;
            {devicesCount} {t.deviceCount}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onEdit(member)} className="text-gray-400 transition-colors hover:text-gray-700">
          <Pencil size={14} />
        </button>
        <button 
          onClick={() => onDelete(member._id)} 
          className="text-red-300 transition-colors hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENT: Edit Member Modal (✏️) ─────────────────────────────────────────
function EditMemberModal({ member, onClose, onSaveStatus, onSaveRole }) {
  const [role, setRole] = useState(member.roleType || "MEMBRE");
  const name = member.profile ? `${member.profile.prenom} ${member.profile.nom}` : member.email;
  const isBlocked = member.status === "BLOCKED";

  return (
    <div className="w-[450px] rounded-3xl bg-white p-6 shadow-2xl animate-fade-in">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Modifier le membre</h3>
      <p className="text-sm text-gray-400 mb-5">Gestion du compte de <strong>{name}</strong></p>
      
      {/* Changer le Rôle */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rôle de l'utilisateur</label>
        <select 
          value={role} 
          onChange={(e) => {
            setRole(e.target.value);
            onSaveRole(member._id, e.target.value);
          }}
          className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-gray-900 focus:outline-none"
        >
          <option value="ADMIN">Administrateur</option>
          <option value="MEMBRE">Membre de la famille</option>
          <option value="INVITE">Invité (Temporaire)</option>
        </select>
      </div>

      {/* Bloquer / Activer le Statut */}
      <div className="mb-6 rounded-2xl bg-gray-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{isBlocked ? "Activer le compte" : "Geler le compte"}</p>
          <p className="text-xs text-gray-400 mt-0.5">{isBlocked ? "Permettre l'accès à la maison" : "Bloquer l'accès temporairement"}</p>
        </div>
        <button 
          onClick={() => onSaveStatus(member._id)}
          className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-colors ${isBlocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
        >
          {isBlocked ? <CheckCircle size={15} /> : <Ban size={15} />}
          {isBlocked ? "Activer" : "Bloquer"}
        </button>
      </div>

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button onClick={onClose} className="rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800">
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENT: Permission Row ───────────────────────────────────────────────
function PermRow({ device, permissions, onChange, t }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "serrure": case "lock": return <Lock size={18} />;
      case "lumiere": case "light": case "lamp": return <Lightbulb size={18} />;
      case "thermostat": case "climatiseur": return <Thermometer size={18} />;
      case "camera": return <Video size={18} />;
      default: return <Lightbulb size={18} />;
    }
  };

  return (
    <div className="flex items-center border-b border-gray-100 py-4 last:border-none">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          {getIcon(device.type || device.id)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{t.deviceNames[device.id] || device.nom || device.name}</p>
          <p className="text-xs text-gray-400">{t.roomsNames[device.piece?.toLowerCase()] || device.piece || device.room || "Salon"}</p>
        </div>
      </div>
      {["admin", "membre", "invite"].map((role) => (
        <div key={role} className="flex w-28 justify-center">
          <Toggle
            checked={permissions ? permissions[role] : false}
            onChange={(val) => onChange(device._id || device.id, role, val)}
          />
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENT: Modal Backdrop ───────────────────────────────────────────────
function ModalBackdrop({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[7px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "fadeInUp 0.18s cubic-bezier(.4,0,.2,1) both" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── COMPONENT: Role Selection Modal ──────────────────────────────────────────
function RoleSelectionModal({ onClose, onNext, t }) {
  const [selected, setSelected] = useState("membre");

  const ROLES_LIST = [
    { key: "admin", Icon: ShieldCheck, data: t.roles.admin },
    { key: "membre", Icon: User, data: t.roles.membre },
    { key: "invite", Icon: Users, data: t.roles.invite },
  ];

  return (
    <div className="w-[520px] rounded-3xl bg-white p-8 shadow-2xl">
      <p className="mb-1 text-center text-xl font-bold text-gray-900">{t.roleTitle}</p>
      <p className="mb-7 text-center text-sm text-gray-400">{t.roleDesc}</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {ROLES_LIST.map(({ key, Icon, data }) => {
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex flex-col items-center rounded-2xl border-2 px-4 py-5 text-center transition-all duration-150 ${
                active ? "border-gray-900 shadow-md" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon size={28} className={`mb-3 ${active ? "text-gray-900" : "text-gray-400"}`} />
              <span className={`mb-2 text-sm font-bold ${active ? "text-gray-900" : "text-gray-700"}`}>{data.label}</span>
              <span className="text-[11px] leading-snug text-gray-400">{data.desc}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800">{t.annuler}</button>
        <button onClick={() => onNext(selected)} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm">
          {t.generateQR}
        </button>
      </div>
    </div>
  );
}

// ─── COMPONENT: QR Code Modal ────────────────────────────────────────────────
const TIMER_TOTAL = 5 * 60;

function QRCodeModal({ onClose, t, language, selectedRole }) {
  const [seconds, setSeconds] = useState(TIMER_TOTAL);
  const intervalRef = useRef(null);

  const idMaison = localStorage.getItem('houseId') || 'maison_test_123';
  
  // 🌟 هنا درنا الـ IP ديالك ذكي: يلا التلفون فـ نفس الـ Wifi غايقرى الـ IP ديال السيرفر نيشان
  const localIP = window.location.hostname === 'localhost' ? '192.168.0.107' : window.location.hostname;
  const registerLink = `http://${localIP}:3000/register?houseId=${idMaison}&role=${selectedRole}`; 

  const startTimer = () => {
    clearInterval(intervalRef.current);
    setSeconds(TIMER_TOTAL);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="w-[600px] rounded-3xl bg-white p-8 shadow-2xl" dir={language === "العربية" ? "rtl" : "ltr"}>
      <div className="flex flex-row items-center gap-10">
        <div className={`flex flex-col items-center gap-4 ${language === "العربية" ? "border-l pl-10" : "border-r pr-10"} border-gray-100`}>
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm bg-white flex items-center justify-center">
            <QRCodeSVG 
              value={registerLink} 
              size={160} 
              bgColor={"#FFFFFF"}
              fgColor={"#111111"}
              includeMargin={false} 
            />
          </div>
          <div className="rounded-full bg-gray-900 px-5 py-1.5 text-sm font-bold tabular-nums text-white tracking-widest">
            {fmt(seconds)}
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">{t.expireMsg}</p>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <ShieldCheck size={20} className="text-gray-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 leading-tight">
            {t.scanTitle}
          </h2>
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            {t.scanDesc}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={startTimer}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={14} className="text-gray-500" />
              {t.regenerateCode}
            </button>
            <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800 underline">
              {t.annuler}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const INITIAL_DEVICES = [
  { id: "serrure", name: "Serrure porte entrée", room: "entree", permissions: { admin: true, membre: true, invite: true } },
  { id: "lumieres", name: "Lumières du salon", room: "salon", permissions: { admin: true, membre: true, invite: false } },
  { id: "thermostat", name: "Thermostat intelligent", room: "couloir", permissions: { admin: true, membre: false, invite: false } },
  { id: "camera", name: "Caméra de l'allée", room: "exterieur", permissions: { admin: true, membre: true, invite: false } },
];

// ─── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────
export default function UsersPage() {
  const [membres, setMembres] = useState([]);
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState(() => {
    const savedFallback = localStorage.getItem("fallback_matrix_permissions");
    return savedFallback ? JSON.parse(savedFallback) : INITIAL_DEVICES;
  });
  const [modalStep, setModalStep] = useState(null);
  const [editingMember, setEditingMember] = useState(null); 
  const [chosenRole, setChosenRole] = useState("membre"); 
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [language, setLanguage] = useState("Français");
  const [currentUserRole, setCurrentUserRole] = useState("MEMBRE"); 
  const navigate = useNavigate();

  // 🌟 الـ URL غايبدل راسو أوتوماتيكياً على حساب المتصفح/الهاتف
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'http://192.168.0.107:5000';

  const fetchMembres = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/users/membres`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMembres(res.data.data);
      }
    } catch (error) {
      console.error("Erreur lors du fetch des membres:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/appareils`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        setDevices(res.data);
      }
    } catch (error) {
      console.log("Using local matrix fallback.");
    }
  };

  const handleDeleteMembre = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce membre ?")) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(`${API_BASE_URL}/api/users/membres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setMembres((prev) => prev.filter((m) => m._id !== id));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE_URL}/api/users/membres/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMembres((prev) => prev.map((m) => m._id === id ? { ...m, status: res.data.data.status } : m));
        setEditingMember((prev) => prev ? { ...prev, status: res.data.data.status } : null);
      }
    } catch (error) {
      setMembres((prev) => prev.map((m) => m._id === id ? { ...m, status: m.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } : m));
      setEditingMember((prev) => prev ? { ...prev, status: prev.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } : null);
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    setMembres((prev) => prev.map((m) => m._id === id ? { ...m, roleType: newRole } : m));
  };

  const handleToggle = async (deviceId, role, value) => {
    let updatedDevices = [];
    setDevices((prev) => {
      updatedDevices = prev.map((d) => {
        const dId = d._id || d.id;
        return dId === deviceId ? { ...d, permissions: { ...d.permissions, [role]: value } } : d;
      });
      localStorage.setItem("fallback_matrix_permissions", JSON.stringify(updatedDevices));
      return updatedDevices;
    });

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/users/membres/permissions`, {
        deviceId,
        role,
        value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erreur permissions", error);
    }
  };

  useEffect(() => {
    fetchMembres();
    fetchDevices();

    const savedRole = localStorage.getItem("roleType");
    if (savedRole) {
      setCurrentUserRole(savedRole.toUpperCase());
    }

    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = translations[language] || translations["Français"];

  const openModal = () => setModalStep("role");
  const closeModal = () => {
    setModalStep(null);
    setEditingMember(null);
  };
  
  const goToQR = (role) => {
    setChosenRole(role);
    setModalStep("qr");
  };

  const filtered = membres.filter((m) => {
    const fullName = m.profile ? `${m.profile.prenom} ${m.profile.nom}` : m.email;
    return fullName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      {modalStep === "role" && (
        <ModalBackdrop onClose={closeModal}>
          <RoleSelectionModal onClose={closeModal} onNext={goToQR} t={t} />
        </ModalBackdrop>
      )}
      {modalStep === "qr" && (
        <ModalBackdrop onClose={closeModal}>
          <QRCodeModal onClose={closeModal} t={t} language={language} selectedRole={chosenRole} />
        </ModalBackdrop>
      )}
      {editingMember && (
        <ModalBackdrop onClose={closeModal}>
          <EditMemberModal 
            member={editingMember} 
            onClose={closeModal} 
            onSaveStatus={handleToggleStatus} 
            onSaveRole={handleUpdateRole}
          />
        </ModalBackdrop>
      )}

      <div className="w-full min-h-screen font-sans text-gray-900 bg-white" dir={language === "العربية" ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t.usersHeader}</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <VoiceControlButton 
              isActive={isVoiceActive} 
              onClick={() => setIsVoiceActive(!isVoiceActive)} 
            />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 py-8 space-y-6">
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-50">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t.activeMembers}</h2>
                <p className="mt-1 text-xs text-gray-400">{t.manageAccess}</p>
              </div>
              
              {currentUserRole === "ADMIN" && (
                <button onClick={openModal} className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors shadow-sm">
                  {t.addMember}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-5">
              {filtered.map((m) => (
                <MemberCard 
                  key={m._id} 
                  member={m} 
                  t={t} 
                  onDelete={handleDeleteMembre} 
                  onEdit={(mem) => setEditingMember(mem)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">{t.matrixTitle}</h2>
            <p className="mt-1 mb-5 text-xs text-gray-400">{t.matrixDesc}</p>
            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="flex-1 text-xs font-medium text-gray-500">{t.resourceHeader}</div>
              {[{ label: t.roles.admin.label, Icon: ShieldCheck }, { label: t.roles.membre.label, Icon: User }, { label: t.roles.invite.label, Icon: Users }].map(({ label, Icon }) => (
                <div key={label} className="flex w-28 flex-col items-center gap-1">
                  <Icon size={17} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>
            {devices.map((device) => (
              <PermRow 
                key={device._id || device.id} 
                device={device} 
                permissions={device.permissions} 
                onChange={handleToggle} 
                t={t} 
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}