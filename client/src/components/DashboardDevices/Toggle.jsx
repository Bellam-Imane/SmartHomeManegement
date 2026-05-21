import React from 'react';

// Composant Toggle réutilisable pour tous les appareils
const Toggle = ({ on, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: 38, height: 22, borderRadius: 50, cursor: 'pointer',
      background: on ? '#1E232A' : 'hsl(210, 5%, 84%)',
      position: 'relative', transition: 'all 0.2s ease',
      flexShrink: 0,
    }}
  >
    <div style={{
      position: 'absolute', width: 16, height: 16, background: 'white',
      borderRadius: '50%', top: 3,
      left: on ? 'calc(100% - 19px)' : 3,
      transition: 'all 0.2s ease',
    }} />
  </div>
);

export default Toggle;