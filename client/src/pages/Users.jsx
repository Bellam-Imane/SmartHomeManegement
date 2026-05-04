import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Bell,
  Mic,
  Pencil,
  Trash2,
  Lock,
  Lightbulb,
  Thermometer,
  Video,
  ShieldCheck,
  User,
  Users,
  UserPlus,
  RefreshCw,
} from "lucide-react";

// COMPONENT: VoiceControlButton 
const VoiceControlButton = ({ onClick, isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg active:scale-95
        ${isActive 
          ? 'bg-red-500 shadow-red-200' 
          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        }`}
      title="Voice Control"
    >
      <span className={`absolute inset-0 rounded-full bg-current opacity-20 animate-ping 
        ${isActive ? 'block' : 'hidden group-hover:block'}`}>
      </span>
      <Mic size={20} className="text-white" />
    </button>
  );
};

//  COMPONENT: Toggle Switch 
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

//  COMPONENT: Badge 
function Badge({ label }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}

// COMPONENT: Status Dot 
function StatusDot({ online }) {
  return (
    <span
      className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
        online ? "bg-green-500" : "bg-gray-400"
      }`}
    />
  );
}

//  COMPONENT: Avatar 
function Avatar({ src, name, bg, color }) {
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold overflow-hidden shadow-sm border border-gray-100"
      style={{ backgroundColor: bg, color }}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name[0]
      )}
    </div>
  );
}

//  COMPONENT: Member Card 
function MemberCard({ member }) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-4">
        <Avatar 
          src={member.image} 
          name={member.name} 
          bg={member.avatarBg} 
          color={member.avatarColor} 
        />
        <div>
          <div className="flex items-center text-sm font-semibold text-gray-900">
            {member.name}
            <Badge label={member.role} />
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <StatusDot online={member.online} />
            {member.online ? "Online" : "Offline"}
            &nbsp;•&nbsp;
            {member.devices} appareils
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-gray-300 transition-colors hover:text-gray-600">
          <Pencil size={14} />
        </button>
        <button className="text-red-300 transition-colors hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// COMPONENT: Permission Row 
function PermRow({ device, permissions, onChange }) {
  return (
    <div className="flex items-center border-b border-gray-100 py-4 last:border-none">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
          {device.icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{device.name}</p>
          <p className="text-xs text-gray-400">{device.room}</p>
        </div>
      </div>
      {["admin", "membre", "invite"].map((role) => (
        <div key={role} className="flex w-28 justify-center">
          <Toggle
            checked={permissions[role]}
            onChange={(val) => onChange(device.id, role, val)}
          />
        </div>
      ))}
    </div>
  );
}

//  COMPONENT: QR Code Placeholder 
function QRCodePlaceholder() {
  const modules = [
    [90,10],[100,10],[110,10],[90,20],[110,20],[100,30],[90,40],[100,40],
    [90,50],[110,50],[90,60],[100,60],[110,60],
    [10,90],[30,90],[50,90],[20,100],[40,100],[10,110],[30,110],[50,110],
    [10,120],[50,120],[20,130],[30,140],[40,140],
    [80,80],[90,80],[100,80],[110,80],[120,80],
    [80,90],[100,90],[120,90],[80,100],[90,100],[110,100],[120,100],
    [80,110],[100,110],[120,110],[80,120],[90,120],[110,120],
    [130,80],[150,80],[170,80],[190,80],
    [140,90],[160,90],[180,90],[130,100],[150,100],[170,100],
    [140,110],[160,110],[130,120],[150,120],[170,120],[190,120],
    [80,130],[100,130],[120,130],[80,140],[90,140],[110,140],
    [80,150],[100,150],[120,150],[80,160],[90,160],[110,160],[120,160],
    [80,170],[100,170],[120,170],[80,180],[90,180],[110,180],
    [130,130],[150,130],[170,130],[190,130],
    [140,140],[160,140],[180,140],[130,150],[170,150],
    [140,160],[160,160],[130,170],[150,170],[170,170],[190,170],
    [140,180],[160,180],[180,180],
  ];
  return (
    <svg viewBox="0 0 200 200" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#111" strokeWidth="6"/>
      <rect x="24" y="24" width="32" height="32" rx="2" fill="#111"/>
      <rect x="130" y="10" width="60" height="60" rx="4" fill="none" stroke="#111" strokeWidth="6"/>
      <rect x="144" y="24" width="32" height="32" rx="2" fill="#111"/>
      <rect x="10" y="130" width="60" height="60" rx="4" fill="none" stroke="#111" strokeWidth="6"/>
      <rect x="24" y="144" width="32" height="32" rx="2" fill="#111"/>
      {modules.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="8" height="8" fill="#111" />
      ))}
    </svg>
  );
}

// COMPONENT: Modal Backdrop 
function ModalBackdrop({ onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.40)", backdropFilter: "blur(7px)" }}
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

// COMPONENT: Role Selection Modal
const ROLES = [
  { key: "admin", label: "Admin", Icon: ShieldCheck, desc: "Accès complet aux paramètres" },
  { key: "membre", label: "Membre", Icon: User, desc: "Contrôle des appareils" },
  { key: "invite", label: "Invité", Icon: UserPlus, desc: "Accès temporaire sélectionné" },
];

function RoleSelectionModal({ onClose, onNext }) {
  const [selected, setSelected] = useState("membre");
  return (
    <div className="w-[520px] rounded-3xl bg-white p-8 shadow-2xl">
      <p className="mb-1 text-center text-xl font-bold text-gray-900">Sélection du Rôle</p>
      <p className="mb-7 text-center text-sm text-gray-400">Choisissez le niveau d'accès pour le nouveau membre</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {ROLES.map(({ key, label, Icon, desc }) => {
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
              <span className={`mb-2 text-sm font-bold ${active ? "text-gray-900" : "text-gray-700"}`}>{label}</span>
              <span className="text-[11px] leading-snug text-gray-400">{desc}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800">Annuler</button>
        <button onClick={() => onNext(selected)} className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm">
          Générer le QR Code
        </button>
      </div>
    </div>
  );
}

// COMPONENT: QR Code Modal 
const TIMER_TOTAL = 5 * 60;

function QRCodeModal({ onClose }) {
  const [seconds, setSeconds] = useState(TIMER_TOTAL);
  const intervalRef = useRef(null);

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
    <div className="w-[600px] rounded-3xl bg-white p-8 shadow-2xl">
      <div className="flex flex-row items-center gap-10">
        <div className="flex flex-col items-center gap-4 border-r border-gray-100 pr-10">
          <div className="rounded-2xl border border-gray-100 p-4 shadow-sm bg-white">
            <QRCodePlaceholder />
          </div>
          <div className="rounded-full bg-gray-900 px-5 py-1.5 text-sm font-bold tabular-nums text-white tracking-widest">
            {fmt(seconds)}
          </div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Expire dans 5 min</p>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <ShieldCheck size={20} className="text-gray-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900 leading-tight">
            Scannez ce code pour rejoindre la maison
          </h2>
          <p className="mb-6 text-sm text-gray-400 leading-relaxed">
            Demandez au nouveau membre de pointer son appareil photo vers ce code pour s'ajouter automatiquement.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={startTimer}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={14} className="text-gray-500" />
              Régénérer le code
            </button>
            <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-gray-800 underline">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  DATA: Members & Devices 
const MEMBERS = [
  { id: 1, name: "Alisha H.", role: "Admin", online: true, devices: 8, avatarBg: "#FDE68A", avatarColor: "#92400E", image: "/assets/user1.jpg" },
  { id: 2, name: "Miguel", role: "Membre", online: true, devices: 3, avatarBg: "#BFDBFE", avatarColor: "#1E40AF", image: "/assets/user2.jpg" },
  { id: 3, name: "Sofia", role: "Membre", online: true, devices: 2, avatarBg: "#BFDBFE", avatarColor: "#1E40AF", image: "/assets/user1.jpg" },
  { id: 4, name: "Karim", role: "Membre", online: false, devices: 1, avatarBg: "#BFDBFE", avatarColor: "#1E40AF", image: "/assets/user2.jpg" },
  { id: 5, name: "Sarah", role: "Invité", online: true, devices: 1, avatarBg: "#FCE7F3", avatarColor: "#9D174D", image: "/assets/user1.jpg" },
  { id: 6, name: "Amine", role: "Invitée", online: true, devices: 2, avatarBg: "#BFDBFE", avatarColor: "#1E40AF", image: "/assets/user2.jpg" },
];

const INITIAL_DEVICES = [
  { id: "serrure", name: "Serrure porte entrée", room: "Entrée", icon: <Lock size={18} />, permissions: { admin: true, membre: true, invite: true } },
  { id: "lumieres", name: "Lumières du salon", room: "salon", icon: <Lightbulb size={18} />, permissions: { admin: true, membre: true, invite: false } },
  { id: "thermostat", name: "Thermostat intelligent", room: "Couloir", icon: <Thermometer size={18} />, permissions: { admin: true, membre: false, invite: false } },
  { id: "camera", name: "Caméra de l'allée", room: "Extérieur", icon: <Video size={18} />, permissions: { admin: true, membre: true, invite: false } },
];

//  MAIN PAGE COMPONENT 
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [modalStep, setModalStep] = useState(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const openModal = () => setModalStep("role");
  const closeModal = () => setModalStep(null);
  const goToQR = () => setModalStep("qr");

  const handleToggle = (deviceId, role, value) => {
    setDevices((prev) => prev.map((d) => d.id === deviceId ? { ...d, permissions: { ...d.permissions, [role]: value } } : d));
  };

  const filtered = MEMBERS.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {modalStep === "role" && (
        <ModalBackdrop onClose={closeModal}>
          <RoleSelectionModal onClose={closeModal} onNext={goToQR} />
        </ModalBackdrop>
      )}
      {modalStep === "qr" && (
        <ModalBackdrop onClose={closeModal}>
          <QRCodeModal onClose={closeModal} />
        </ModalBackdrop>
      )}

      <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: "#ffffff" }}>
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-900 transition-colors"><ArrowLeft size={20} /></button>
            <div className="h-9 w-px bg-gray-200" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Membres et famille</h1>
              <p className="mt-0.5 text-xs text-gray-400">10 membres au total dans le foyer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <Search size={14} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="rechercher..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-52 bg-transparent text-sm outline-none" 
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50">
              <Bell size={17} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-[9px] font-bold text-white">1</span>
            </button>
            <VoiceControlButton 
              isActive={isVoiceActive} 
              onClick={() => setIsVoiceActive(!isVoiceActive)} 
            />
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-8 py-8 space-y-6">
          {/* Active Members Section */}
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-50">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Membres Actifs</h2>
                <p className="mt-1 text-xs text-gray-400">Gérez les personnes qui ont accès au foyer</p>
              </div>
              <button onClick={openModal} className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors shadow-sm">
                Ajouter un membre
              </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {filtered.map((m) => (<MemberCard key={m.id} member={m} />))}
            </div>
          </div>

          {/* Permissions Matrix Section */}
          <div className="rounded-2xl bg-white p-7 shadow-sm border border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Matrice des Permissions</h2>
            <p className="mt-1 mb-5 text-xs text-gray-400">Définissez un accès granulaire pour chaque rôle.</p>
            <div className="flex items-center border-b border-gray-100 pb-3">
              <div className="flex-1 text-xs font-medium text-gray-500">Appareil / Ressource</div>
              {[{ label: "Admin", Icon: ShieldCheck }, { label: "Membre", Icon: User }, { label: "Invité", Icon: Users }].map(({ label, Icon }) => (
                <div key={label} className="flex w-28 flex-col items-center gap-1">
                  <Icon size={17} className="text-gray-600" />
                  <span className="text-xs font-semibold text-gray-800">{label}</span>
                </div>
              ))}
            </div>
            {devices.map((device) => (<PermRow key={device.id} device={device} permissions={device.permissions} onChange={handleToggle} />))}
          </div>
        </div>
      </div>
    </>
  );
}