import { useState } from "react";
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
} from "lucide-react";

// ─── Avatar Component (التعديل الوحيد اللي زدت هو هاد الجزء باش يقرأ الصور) ───
function Avatar({ name, src }) {
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full overflow-hidden bg-gray-100">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="text-sm font-semibold text-gray-600">{name[0]}</div>
      )}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────────────
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

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ label }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600">
      {label}
    </span>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────────────────
function StatusDot({ online }) {
  return (
    <span
      className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
        online ? "bg-green-500" : "bg-gray-400"
      }`}
    />
  );
}

// ─── Member Card (رجعتو كيف كان وزدت src ف الـ Avatar) ───────────────────────
function MemberCard({ member }) {
  return (
    <div
      className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-4">
        {/* هنا ناديت على الصورة */}
        <Avatar name={member.name} src={member.img} />
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

// ─── Permission Row ───────────────────────────────────────────────────────────
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

// ─── Initial Data (ربطت الصور بـ user1 و user2) ─────────────────────────────
const MEMBERS_DATA = [
  { id: 1, name: "Alisha H.", role: "Admin",  online: true,  devices: 8, img: "/assets/user1.jpg" },
  { id: 2, name: "Miguel",   role: "Membre", online: true,  devices: 3, img: "/assets/user2.jpg" },
  { id: 3, name: "Sarah",    role: "Invité", online: true,  devices: 1, img: "/assets/user1.jpg" },
  { id: 4, name: "James",    role: "Membre", online: false, devices: 4, img: "/assets/user2.jpg" },
  { id: 5, name: "Elena",    role: "Invité", online: true,  devices: 2, img: "/assets/user1.jpg" },
  { id: 6, name: "Miguel",   role: "Membre", online: true,  devices: 2, img: "/assets/user2.jpg" },
];

const INITIAL_DEVICES = [
  { id: "serrure", name: "Serrure porte entrée", room: "Entrée", icon: <Lock size={18} />, permissions: { admin: true, membre: true, invite: true } },
  { id: "lumieres", name: "Lumières du salon", room: "salon", icon: <Lightbulb size={18} />, permissions: { admin: true, membre: true, invite: false } },
  { id: "thermostat", name: "Thermostat intelligent", room: "Couloir", icon: <Thermometer size={18} />, permissions: { admin: true, membre: false, invite: false } },
  { id: "camera", name: "Caméra de l'allée", room: "Extérieur", icon: <Video size={18} />, permissions: { admin: true, membre: true, invite: false } },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [members] = useState(MEMBERS_DATA);
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  const handleToggle = (deviceId, role, value) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, permissions: { ...d.permissions, [role]: value } }
          : d
      )
    );
  };

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900" style={{backgroundColor:"#ffffff"}}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5">
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="h-9 w-px bg-gray-200" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Members et famille
            </h1>
            <p className="mt-0.5 text-xs text-gray-400">
              10 membres au total dans le foyer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="chercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <Bell size={17} />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-400 text-[9px] font-bold text-white leading-none">
              1
            </span>
          </button>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700">
              <Mic size={14} />
            </div>
            <span className="text-sm font-bold text-gray-900">contrôle vocal</span>
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-8 space-y-6">
        {/* ── Active Members (الزر رجع كيف كان) ── */}
        <div className="rounded-2xl bg-white p-7" style={{boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)"}}>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Membres Actifs</h2>
              <p className="mt-1 text-xs text-gray-400">
                Gérez les personnes qui ont accès au tableau de bord de votre maison
              </p>
            </div>
            {/* هاد الزر رجعتو للشكل الأصلي ديالك */}
            <button className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors shadow-sm">
              Ajouter un membre
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {filtered.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </div>

        {/* ── Permissions Matrix ── */}
        <div className="rounded-2xl bg-white p-7" style={{boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)"}}>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Matrice des Permissions</h2>
            <p className="mt-1 text-xs text-gray-400">
              Définissez un accès granulaire pour chaque rôle au sein des pièces et des appareils.
            </p>
          </div>

          <div className="flex items-center border-b border-gray-100 pb-3">
            <div className="flex-1 text-xs font-medium text-gray-500">
              Appareil / Ressource
            </div>
            {[
              { label: "Admin",  Icon: ShieldCheck },
              { label: "Membre", Icon: User },
              { label: "Invité", Icon: Users },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex w-28 flex-col items-center gap-1">
                <Icon size={17} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-800">{label}</span>
              </div>
            ))}
          </div>

          {devices.map((device) => (
            <PermRow
              key={device.id}
              device={device}
              permissions={device.permissions}
              onChange={handleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
}