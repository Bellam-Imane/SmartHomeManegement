import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  Bell, CheckCheck, Trash2, Loader2, ShieldAlert, 
  Zap, Settings, Cpu, Smartphone, Inbox, X 
} from 'lucide-react';
import VoiceControlButton from '../components/VoiceControlButton';
import NotificationItem from '../components/NotificationItem';

const { translations } = require("../translations");

const API_BASE = 'http://localhost:5000';

// Filter tabs with their corresponding categorie values
const FILTER_TABS = [
  { label: 'Toutes',        value: 'ALL',        icon: Bell },
  { label: 'Sécurité',      value: 'SECURITE',   icon: ShieldAlert },
  { label: 'Énergie',       value: 'ENERGIE',    icon: Zap },
  { label: 'Système',       value: 'SYSTEME',    icon: Settings },
  { label: 'Automatisation',value: 'AUTOMATION',  icon: Cpu },
  { label: 'Appareils',     value: 'APPAREIL',   icon: Smartphone },
];

const Notifications = () => {
  const [language, setLanguage] = useState("Français");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);
  const activeFilterRef = useRef('ALL');

  const t = translations[language] || translations["Français"];

  // Inline toast helper
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Auto-dismiss error banner after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- Language persistence ---
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- Auth headers ---
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  // --- Fetch notifications from API ---
  const fetchNotifications = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.set('categorie', activeFilter);
      params.set('limit', '50');

      const res = await axios.get(
        `${API_BASE}/api/notifications?${params.toString()}`,
        { headers: getHeaders() }
      );

      if (res.data.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("[Notifications] Fetch error:", err.message);
      setError("Impossible de charger les notifications.");
      showToast("Erreur lors du chargement des notifications.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeFilter, getHeaders, showToast]);

  // --- Keep activeFilterRef in sync with state ---
  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  // --- Initial fetch + refetch on filter change ---
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Socket.IO: real-time notifications (connect once, no reconnect on filter change) ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('new_notification', (notif) => {
      // Use ref to avoid reconnecting on filter change
      const currentFilter = activeFilterRef.current;
      setNotifications(prev => {
        if (currentFilter !== 'ALL' && notif.categorie !== currentFilter) return prev;
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    // When other components/pages read or delete notifications, refetch unread count from DB
    socket.on('notifications_changed', async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUnreadCount(res.data.count || 0);
        }
      } catch (e) {
        // Silent fail — count will self-correct on next fetch
      }
    });

    return () => { socket.disconnect(); };
  }, []); // Empty deps — connect only once

  // --- Mark one notification as read ---
  const handleMarkRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      (n._id === id || n.id === id) ? { ...n, estLue: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await axios.put(
        `${API_BASE}/api/notifications/${id}/read`,
        {},
        { headers: getHeaders() }
      );
    } catch (err) {
      console.error("[Notifications] Mark read error:", err.message);
      // Rollback: restore unread state
      setNotifications(prev => prev.map(n => 
        (n._id === id || n.id === id) ? { ...n, estLue: false } : n
      ));
      setUnreadCount(prev => prev + 1);
    }
  }, [getHeaders]);

  // --- Mark all as read ---
  const handleMarkAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, estLue: true })));
    setUnreadCount(0);

    try {
      await axios.put(
        `${API_BASE}/api/notifications/read-all`,
        {},
        { headers: getHeaders() }
      );
      showToast("Toutes les notifications marquées comme lues.", 'success');
    } catch (err) {
      console.error("[Notifications] Mark all read error:", err.message);
      showToast("Erreur lors du marquage.");
    }
  }, [getHeaders, showToast]);

  // --- Delete one ---
  const handleDelete = useCallback(async (id) => {
    // Capture removed item and its index for proper rollback
    let removedItem = null;
    let removedIndex = -1;

    setNotifications(prev => {
      const idx = prev.findIndex(n => n._id === id || n.id === id);
      if (idx === -1) return prev;
      removedItem = prev[idx];
      removedIndex = idx;
      return prev.filter((_, i) => i !== idx);
    });

    if (removedItem && !removedItem.estLue) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`${API_BASE}/api/notifications/${id}`, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error("[Notifications] Delete error:", err.message);
      // Rollback: restore at original position
      if (removedItem) {
        setNotifications(prev => {
          const restored = [...prev];
          restored.splice(removedIndex, 0, removedItem);
          return restored;
        });
      }
      showToast("Erreur lors de la suppression.");
    }
  }, [getHeaders, showToast]);

  // --- Delete all ---
  const handleDeleteAll = useCallback(async () => {
    let previous = [];
    setNotifications(prev => { previous = [...prev]; return []; });
    setUnreadCount(0);

    try {
      await axios.delete(`${API_BASE}/api/notifications`, {
        headers: getHeaders()
      });
      showToast("Toutes les notifications supprimées.", 'success');
    } catch (err) {
      console.error("[Notifications] Delete all error:", err.message);
      setNotifications(previous);
      showToast("Erreur lors de la suppression.");
    }
  }, [getHeaders, showToast]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-gray-500" />
          <p className="text-gray-500 font-medium">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-transparent" dir={language === "العربية" ? "rtl" : "ltr"}>
      {/* Inline Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t.notifHeader}</h1>
            <p className="text-gray-500 mt-0.5 text-sm font-medium">
              {t.notifSubHeader}
              {unreadCount > 0 && (
                <span className="ml-2 text-blue-500 font-semibold">
                  ({unreadCount} non lue{unreadCount > 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => fetchNotifications(false)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            title="Rafraîchir"
          >
            <Loader2 size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all"
            >
              <CheckCheck size={16} />
              Tout lire
            </button>
          )}

          {/* Delete all */}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-red-100 text-red-500 text-xs font-semibold hover:bg-red-50 transition-all"
            >
              <Trash2 size={16} />
              Tout supprimer
            </button>
          )}

          <VoiceControlButton />
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {FILTER_TABS.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-[#1e293b] text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="mt-6 bg-white/80 backdrop-blur-md rounded-[35px] shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="p-4 rounded-full bg-gray-100 mb-4">
              <Inbox size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-semibold text-sm">
              {activeFilter === 'ALL' 
                ? 'Aucune notification pour le moment.' 
                : `Aucune notification dans "${FILTER_TABS.find(t => t.value === activeFilter)?.label}".`
              }
            </p>
            <p className="text-gray-300 text-xs mt-1">
              Les alertes de sécurité et les rapports d'énergie apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif._id || notif.id}
                notif={notif}
                onClick={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
