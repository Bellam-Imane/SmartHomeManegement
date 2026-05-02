import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

const MainLayout = () => {
  return (
    
    <div className="flex min-h-screen bg-gray-50 w-full overflow-x-hidden">
      
      
      <aside className="w-24 min-h-screen flex items-center justify-center p-2">
        <Sidebar />
      </aside>

      
      <main className="flex-1 p-4 flex flex-col min-h-screen w-full">
        
        
        <div className="flex-1 w-full h-full">
          <Outlet />
        </div>

      </main>
      
    </div>
  );
};

export default MainLayout;