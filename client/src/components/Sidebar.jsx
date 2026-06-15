import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

import { 
  LayoutDashboard, 
  DoorOpen, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  BarChart3,
  Bell, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const Sidebar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch initial unread count
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUnreadCount(res.data.count || 0);
        }
      } catch (err) {
        // Silent fail — badge is non-critical
      }
    };
    fetchCount();

    // Listen for real-time updates
    const socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('new_notification', () => {
      setUnreadCount(prev => prev + 1);
    });

    // Refresh badge when notifications are read/deleted from the Notifications page
    socket.on('notifications_changed', () => {
      fetchCount();
    });

    // When user marks notifications as read on the Notifications page,
    // we can listen for a custom event or just poll periodically
    const interval = setInterval(fetchCount, 30000); // refresh every 30s

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const menuItems = [
    { id: 1, path: "/home/Dashboard", icon: LayoutDashboard },
    { id: 2, path: "/home/Rooms", icon: DoorOpen },
    { id: 3, path: "/home/Devices", icon: Smartphone },
    { id: 4, path: "/home/Energy", icon: Zap },
    { id: 5, path: "/home/Security", icon: ShieldCheck },
    { id: 6, path: "/home/Automation", icon: Cpu },
    { id: 7, path: "/home/Rapports", icon: BarChart3 },
    { id: 8, path: "/home/Notifications", icon: Bell, badge: true },
    { id: 9, path: "/home/Users", icon: Users },
    { id: 10, path: "/home/Settings", icon: Settings },
    { id: 11, icon: LogOut, logout: true },
  ];

  return (
    
    <div className="h-full w-full bg-[#b5b8c4] rounded-[40px] flex flex-col items-center py-8 shadow-xl ">

      {/* MENU */}
      
      <nav className="flex flex-col space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return item.logout ? (
            <button
              key={item.id}
              onClick={handleLogout}
              className="relative w-12 h-12 flex items-center justify-center transition-all duration-300 rounded-2xl text-[#4A4D5A] opacity-60 hover:opacity-100 hover:scale-105 hover:bg-red-100 hover:text-red-600"
              title="Logout"
            >
              <Icon size={21} />
            </button>
          ) : (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `relative w-12 h-12 flex items-center justify-center transition-all duration-300 rounded-2xl ${
                  isActive
                    ? 'bg-[#f8f3ed] text-[#111827] shadow-md scale-110'
                    : 'text-[#4A4D5A] opacity-60 hover:opacity-100 hover:scale-105'
                }`
              }
            >
              <Icon size={21} />
              {item.badge && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-md">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
