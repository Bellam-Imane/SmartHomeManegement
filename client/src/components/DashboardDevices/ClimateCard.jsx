import React from 'react';
import Toggle from './Toggle';
import { Sun, Zap } from 'lucide-react';

const ClimateCard = ({ isOn, onToggle, img }) => {
  return (
    <div style={{ background: '#F9F4EF', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>climatiseur</span>
        <Toggle on={isOn} onToggle={onToggle} />
      </div>
      <div style={{ width: '100%', maxWidth: 180, aspectRatio: '1/1' }}>
        <img src={img} alt="AC" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: isOn ? 1 : 0.5, transition: 'opacity 0.3s ease' }} />
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sun size={14} color="#9ca3af" /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>AUTO</span><span style={{ fontSize: 9, color: '#9ca3af' }}>mode auto</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={14} color="#9ca3af" /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>137 min</span><span style={{ fontSize: 9, color: '#9ca3af' }}>refroid.</span></div>
        </div>
      </div>
    </div>
  );
};

export default ClimateCard;