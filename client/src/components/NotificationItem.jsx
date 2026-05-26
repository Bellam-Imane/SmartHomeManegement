import React from 'react';

const NotificationItem = ({ notif, onClick }) => {
  const Icon = notif.icon;

  
  const getStyles = (notif) => {
    
    if (notif.isRead) {
      return { 
        text: 'text-gray-500', 
        icon: 'text-gray-400', 
        bg: 'bg-[#f9fafb]' 
      };
    }
    
    
    switch(notif.type) {
      case 'danger': return { text: 'text-red-600', icon: 'text-red-500', bg: 'bg-white' };
      case 'routine': return { text: 'text-orange-500', icon: 'text-orange-400', bg: 'bg-white' };
      case 'eco': return { text: 'text-blue-500', icon: 'text-blue-400', bg: 'bg-white' };
      default: return { text: 'text-gray-900', icon: 'text-gray-600', bg: 'bg-white' };
    }
  };

  const styles = getStyles(notif);

  return (
    <div 
      onClick={() => onClick(notif.id)}
      className={`flex items-start gap-6 p-6 transition-all duration-300 cursor-pointer hover:brightness-95 ${styles.bg}`}
    >
      
      <div className={`p-3 rounded-2xl bg-white shadow-sm border border-gray-50 ${styles.icon}`}>
        <Icon size={24} />
      </div>

      
      <div className="flex-1">
        <h3 className={`font-bold text-lg ${styles.text}`}>
          {notif.title}
        </h3>
        <p className={`text-sm mt-1 leading-relaxed ${notif.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
          {notif.desc}
        </p>
      </div>

      
      {!notif.isRead && (
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
      )}
    </div>
  );
};

export default NotificationItem;