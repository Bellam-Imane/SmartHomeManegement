import React from 'react';

import VoiceControlButton from '../components/VoiceControlButton';

const Rooms = () => {
  
  const handleVoiceClick = () => {
    console.log("Microphone cliqué");
  };

  return (
    <header className="flex items-center justify-between p-6 bg-white/50 backdrop-blur-md rounded-2xl shadow-sm">
      <div>
        <h1 className="text-3xl font-bold text-gray-800" >
          Mes Pièces 
        </h1>
        <p  className="text-gray-500 mt-1 text-sm font-medium" >
          Gérez les appareils de chaque pièce.
        </p>
      </div>
      <VoiceControlButton  onClick={handleVoiceClick} />

    </header>
  );
};

export default Rooms;