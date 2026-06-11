import React from 'react';
import Toggle from './Toggle';
import { Lightbulb } from 'lucide-react';

const LightCard = ({ isOn, onToggle, val, setVal, img, onIntensityChange }) => {
  return (
    <div style={{ background: '#EAEAEA', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '280px' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Lumière ES</span>
        <Toggle on={isOn} onToggle={onToggle} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
        <img src={img} alt="Light" style={{ maxHeight: '150px', objectFit: 'contain', opacity: isOn ? 1 : 0.4, filter: isOn ? `drop-shadow(0 0 ${val / 10}px rgba(251, 191, 36, 0.4))` : 'none', transition: 'all 0.3s ease' }} />
      </div>
      <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 50, height: '45px', display: 'flex', alignItems: 'center', padding: '0 10px', position: 'relative', marginTop: 10 }}>
        <input type="range" min="0" max="100" value={val} onChange={(e) => {
          const newVal = parseInt(e.target.value);
          setVal(newVal);
          if (onIntensityChange) onIntensityChange(newVal);
        }} style={{ position: 'absolute', width: '90%', left: '5%', zIndex: 3, opacity: 0, cursor: 'pointer', height: '100%' }} />
        <div style={{ position: 'absolute', left: `${Math.max(8, Math.min(92, val))}%`, transform: 'translateX(-50%)', width: '35px', height: '35px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 2, pointerEvents: 'none' }}>
          <Lightbulb size={18} color={isOn ? "#fbbf24" : "#cbd5e1"} />
        </div>
        <span style={{ marginLeft: 'auto', marginRight: 15, color: 'white', fontSize: 13, fontWeight: 600, opacity: 0.5 }}>{val}%</span>
      </div>
    </div>
  );
};

export default LightCard;