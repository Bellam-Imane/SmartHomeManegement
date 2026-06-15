import React from 'react';
import { 
  ShieldAlert, Zap, Settings, Cpu, Smartphone, 
  Info, Trash2 
} from 'lucide-react';

// Dynamic icon mapping based on notification categorie/type
const ICON_MAP = {
  SECURITE: ShieldAlert,
  ENERGIE: Zap,
  SYSTEME: Settings,
  AUTOMATION: Cpu,
  APPAREIL: Smartphone
};

// Color scheme per categorie
const COLOR_MAP = {
  SECURITE:  { icon: 'text-red-500',    badge: 'bg-red-50 text-red-600',       dot: 'bg-red-500' },
  ENERGIE:   { icon: 'text-yellow-500', badge: 'bg-yellow-50 text-yellow-600', dot: 'bg-yellow-500' },
  SYSTEME:   { icon: 'text-blue-500',   badge: 'bg-blue-50 text-blue-600',     dot: 'bg-blue-500' },
  AUTOMATION:{ icon: 'text-purple-500', badge: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' },
  APPAREIL:  { icon: 'text-gray-500',   badge: 'bg-gray-50 text-gray-600',     dot: 'bg-gray-500' }
};

// Relative time formatter
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHrs < 24) return `il y a ${diffHrs}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const NotificationItem = ({ notif, onClick, onDelete }) => {
  const cat = (notif.categorie || 'SYSTEME').toUpperCase();
  const Icon = ICON_MAP[cat] || Info;
  const colors = COLOR_MAP[cat] || COLOR_MAP.SYSTEME;
  const isRead = notif.estLue;

  return (
    <div 
      onClick={() => onClick(notif._id || notif.id)}
      className={`group flex items-start gap-5 p-5 transition-all duration-300 cursor-pointer 
        hover:bg-gray-50/80 ${isRead ? 'opacity-60' : 'bg-white'}`}
    >
      {/* Icon */}
      <div className={`p-3 rounded-2xl shrink-0 ${isRead ? 'bg-gray-100 text-gray-400' : `bg-white shadow-sm border border-gray-50 ${colors.icon}`}`}>
        <Icon size={22} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-bold text-sm truncate ${isRead ? 'text-gray-400' : 'text-gray-800'}`}>
            {notif.titre || notif.title || 'Notification'}
          </h3>
          {/* Category badge */}
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${isRead ? 'bg-gray-100 text-gray-400' : colors.badge}`}>
            {cat}
          </span>
        </div>
        <p className={`text-xs leading-relaxed line-clamp-2 ${isRead ? 'text-gray-300' : 'text-gray-500'}`}>
          {notif.message || notif.desc || ''}
        </p>
        {/* Timestamp */}
        <span className={`text-[10px] mt-1.5 block ${isRead ? 'text-gray-300' : 'text-gray-400'}`}>
          {formatTimeAgo(notif.dateHeure)}
        </span>
      </div>

      {/* Right: unread dot + delete button */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        {!isRead && (
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} shadow-[0_0_8px_rgba(59,130,246,0.4)]`} />
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(notif._id || notif.id); }}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
