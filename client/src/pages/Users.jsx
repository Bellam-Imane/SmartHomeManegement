import React from 'react';

const Users = () => {

  return (
    
    <div className="bg-white p-8 rounded-[40px] shadow-sm w-full min-h-[calc(100vh-2.5rem)] flex flex-col">
      
      {/* Header الصفحة */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les membres de la famille et leurs accès.</p>
        </div>
      </div>

    </div>
  );
};

export default Users;