import React from 'react';
import Toggle from './Toggle';
import { Zap } from 'lucide-react';

const VacuumCard = ({ isOn, onToggle, img }) => {
  return (
    <div style={{ background: '#EAEAEA', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '280px' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Aspirateur</span>
        <Toggle on={isOn} onToggle={onToggle} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px 0' }}>
        <img src={img} alt="Vacuum" style={{ maxHeight: '140px', width: 'auto', objectFit: 'contain', opacity: isOn ? 1 : 0.5, filter: isOn ? 'none' : 'grayscale(80%)', transition: 'all 0.3s ease' }} />
      </div>
      <div style={{ width: '100%', background: '#1a1a2e', borderRadius: 50, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={16} color="#fbbf24" fill="#fbbf24" /></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1 }}>69%</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Batterie</span>
        </div>
      </div>
    </div>
  );
};

export default VacuumCard;