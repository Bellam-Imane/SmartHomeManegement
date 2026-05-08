import React, { useState } from 'react';
import { Activity, Zap, DoorOpen, RefreshCw } from 'lucide-react';
import VoiceControlButton from '../components/VoiceControlButton';
import NotificationItem from '../components/NotificationItem'; // Import dyal l-component jdid

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Mouvement Détecté", desc: "Un mouvement a été détecté dans le Salon à 02:30 AM.", type: "danger", isRead: false, icon: Activity },
    { id: 2, title: "Optimisation Énergie", desc: "Voulez-vous fermer les rideaux pour réduire la clim de 15% ?", type: "routine", isRead: false, icon: Zap },
    { id: 3, title: "Porte Ouverte", desc: "La porte principale est restée ouverte plus de 5 minutes.", type: "danger", isRead: true, icon: DoorOpen },
    { id: 4, title: "Économie Hebdomadaire", desc: "Votre consommation a baissé de 10% par rapport à la semaine dernière.", type: "eco", isRead: false, icon: Zap },
    { id: 5, title: "Système à jour", desc: "Le système ESP32 a été mis à jour avec succès.", type: "normal", isRead: true, icon: RefreshCw }
  ]);

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  return (
    <div className="p-8 min-h-screen">
      <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm font-medium">Restez informé de l'état de votre maison.</p>
        </div>
        <VoiceControlButton onClick={() => console.log("Voice control clicked")} />
      </header>

      <div className="mt-10 bg-white/80 backdrop-blur-md rounded-[35px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <NotificationItem 
              key={notif.id} 
              notif={notif} 
              onClick={handleNotificationClick} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;