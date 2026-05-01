import React from 'react';

const Rapports = () => {
  return (
    /* نفس القياسات باش يبقاو الصفحات كلهم "خوت" فالتصميم */
    <div className="bg-white p-8 rounded-[40px] shadow-sm w-full min-h-[calc(100vh-2.5rem)] flex flex-col">
      
      {/* Header الصفحة */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Rapports</h1>
          <p className="text-gray-500 mt-1">Consultez l'historique et les journaux d'activité.</p>
        </div>
        
      </div>


    </div>
  );
};

export default Rapports;