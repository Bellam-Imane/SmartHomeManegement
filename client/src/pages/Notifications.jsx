import React, { useState, useEffect } from 'react';
import { Activity, Zap, DoorOpen, RefreshCw } from 'lucide-react';
import VoiceControlButton from '../components/VoiceControlButton';
import NotificationItem from '../components/NotificationItem';

// استيراد ملف الترجمة المتوافق مع الـ Webpack
const { translations } = require("../translations");

const Notifications = () => {
  const [language, setLanguage] = useState("Français");
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // مراقبة تغيير اللغة فـ localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = translations[language] || translations["Français"];

  // الـ State ديال الإشعارات مع ربط الـ title والـ desc بالترجمة الديناميكية
  const [notifications, setNotifications] = useState([
    { id: 1, key: "mouvement", type: "danger", isRead: false, icon: Activity },
    { id: 2, key: "optimisation", type: "routine", isRead: false, icon: Zap },
    { id: 3, key: "porte", type: "danger", isRead: true, icon: DoorOpen },
    { id: 4, key: "economie", type: "eco", isRead: false, icon: Zap },
    { id: 5, key: "systeme", type: "normal", isRead: true, icon: RefreshCw }
  ]);

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  return (
    <div className="p-8 min-h-screen bg-transparent" dir={language === "العربية" ? "rtl" : "ltr"}>
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t.notifHeader}</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">{t.notifSubHeader}</p>
        </div>
        <VoiceControlButton 
          isActive={isVoiceActive} 
          onClick={() => setIsVoiceActive(!isVoiceActive)} 
        />
      </header>

      <div className="mt-10 bg-white/80 backdrop-blur-md rounded-[35px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => {
            // دمج النصوص المترجمة مع كائن الإشعار قبل تمريره للـ Component الفرعي
            const translatedNotif = {
              ...notif,
              title: t.notifData[notif.key]?.title || "",
              desc: t.notifData[notif.key]?.desc || ""
            };

            return (
              <NotificationItem 
                key={notif.id} 
                notif={translatedNotif} 
                onClick={handleNotificationClick} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;