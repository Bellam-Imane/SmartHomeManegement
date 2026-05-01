import React from 'react';
import { NavLink } from 'react-router-dom';

import { 
  LayoutDashboard, 
  DoorOpen, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {

  const menuItems = [
    { id: 1, path: "/home/Dashboard", icon: LayoutDashboard },
    { id: 2, path: "/home/Rooms", icon: DoorOpen },
    { id: 3, path: "/home/Devices", icon: Smartphone },
    { id: 4, path: "/home/Energy", icon: Zap },
    { id: 5, path: "/home/Security", icon: ShieldCheck },
    { id: 6, path: "/home/Automation", icon: Cpu },
    { id: 7, path: "/home/Rapports", icon: BarChart3 },
    { id: 8, path: "/home/Users", icon: Users },
    { id: 9, path: "/home/Settings", icon: Settings },
    { id: 10, path: "/home/Logout", icon: LogOut },
  ];

  return (
    
    <div className="h-[95vh] w-full bg-[#b5b8c4] rounded-[40px] flex flex-col items-center py-8 shadow-xl overflow-y-auto no-scrollbar">

      {/* MENU */}
      
      <nav className="flex flex-col space-y-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-12 h-12 flex items-center justify-center transition-all duration-300 rounded-2xl ${
                  isActive
                    ? 'bg-[#f8f3ed] text-[#111827] shadow-md scale-110'
                    : 'text-[#4A4D5A] opacity-60 hover:opacity-100 hover:scale-105'
                }`
              }
            >
              <Icon size={22} /> 
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;