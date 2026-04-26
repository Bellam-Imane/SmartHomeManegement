import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Settings, Power, Bell } from 'lucide-react';

const Sidebar = () => {
  
  const menuItems = [
    { icon: <Home size={24} />, path: "/home/rooms" },
    { icon: <LayoutGrid size={24} />, path: "/home/devices" },
    { icon: <Bell size={24} />, path: "/home/notifications" },
    { icon: <Settings size={24} />, path: "/home/settings" },
  ];

  return (
    <div className="h-full bg-white border-r border-gray-100 flex flex-col items-center py-8 justify-between shadow-sm">
      
      
      <div className="text-[#0d8363] w-12 h-12 bg-[#0d8363]/10 rounded-2xl flex items-center justify-center mb-10">
        <Home size={28} fill="currentColor" />
      </div>

      
      <nav className="flex flex-col space-y-6">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            
            className={({ isActive }) =>
              `p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                ? 'bg-[#0d8363] text-white shadow-lg shadow-[#0d8363]/40' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-[#0d8363]'
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>

      
      <button className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
        <Power size={24} />
      </button>
      
    </div>
  );
};

export default Sidebar;