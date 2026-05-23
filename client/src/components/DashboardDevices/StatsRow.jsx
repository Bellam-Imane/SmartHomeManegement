import React from 'react';
import { Thermometer, Sun, Zap, Droplets } from 'lucide-react';

const StatsRow = () => {
  const stats = [
    { label: 'Temp. intérieure', value: '24°C', icon: <Thermometer size={16} color="#9ca3af" /> },
    { label: 'Temp. extérieure', value: '18°C', icon: <Sun size={16} color="#9ca3af" /> },
    { label: 'Energie consommée', value: '13 kwh', icon: <Zap size={16} color="#9ca3af" /> },
    { label: 'Humidité', value: '75%', icon: <Droplets size={16} color="#9ca3af" /> },
    { label: 'Energie solaire', value: '78 kwh', icon: <Sun size={16} color="#9ca3af" /> }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', flex: 1, minWidth: 0 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {s.icon}
            <span style={{ fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, color: '#1a1a2e' }}>{s.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;