import React from 'react';
import { Lock, Unlock } from 'lucide-react';

const LockCard = ({ isLocked, onToggle, img }) => {
  return (
    <div style={{ background: '#EAEAEA', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '320px' }}>
      <div style={{ width: '100%', textAlign: 'center' }}><p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>serrure de porte</p></div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px 0' }}>
        <img src={img} alt="Lock" style={{ maxHeight: '160px', width: 'auto', objectFit: 'contain', opacity: isLocked ? 1 : 0.7, filter: isLocked ? 'none' : 'grayscale(50%)', transition: 'all 0.3s ease' }} />
      </div>
      <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 50, height: '45px', display: 'flex', alignItems: 'center', padding: '0 10px', position: 'relative', marginTop: 10 }}>
        <input type="range" min="0" max="1" step="1" value={isLocked ? 0 : 1} onChange={(e) => onToggle(e.target.value === "0")} style={{ position: 'absolute', width: '90%', left: '5%', zIndex: 3, opacity: 0, cursor: 'pointer', height: '100%' }} />
        <div style={{ position: 'absolute', left: isLocked ? '10%' : '90%', transform: 'translateX(-50%)', width: '35px', height: '35px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2, pointerEvents: 'none' }}>
          {isLocked ? <Lock size={18} color="#1a1a2e" /> : <Unlock size={18} color="#ef4444" />}
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, opacity: 0.3 }}>{[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 4, height: 4, background: 'white', borderRadius: '50%' }} />)}</div>
      </div>
    </div>
  );
};

export default LockCard;