import React from 'react';

const EnergyChart = ({ activeTab, setActiveTab, currentData }) => {
  return (
    <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 600 }}>Aperçu de la situation énergétique</span>
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, gap: 2 }}>
          {['Jour', 'Mois', 'Années'].map(t => (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)} 
              style={{ 
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', 
                background: activeTab === t ? '#687586' : 'transparent', 
                color: activeTab === t ? 'white' : '#1a1a2e' 
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 200 }}>
        {currentData.heights.map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: `${h}%`, background: h >= 90 ? '#687586' : '#8DB0C6', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease' }} />
            <span style={{ fontSize: 9, color: '#8DB0C6', whiteSpace: 'nowrap' }}>{currentData.labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyChart;