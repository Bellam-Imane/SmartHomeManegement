import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

const MainLayout = () => {
  return (
    
    <div className="flex min-h-screen bg-[#f8f9fa]">
      
      
      <aside className="w-20 lg:w-24 fixed h-full z-50">
        <Sidebar />
      </aside>

      
      <main className="flex-1 ml-20 lg:ml-24 p-8">
        
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default MainLayout;