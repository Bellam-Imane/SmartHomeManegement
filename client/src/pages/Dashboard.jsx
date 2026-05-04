import React, { useState } from 'react';
import livingRoomImg from '../assets/livingrom.jpeg';
import user1 from '../assets/profile1.jfif';
import user2 from '../assets/profile2.jfif';
import user3 from '../assets/profile3.jfif';
import climatiseurImg from '../assets/climatiseur-removebg-preview.png';
import lockImg from '../assets/sereure-removebg-preview.png';
import lightImg from '../assets/lumiére-removebg-preview.png';
import vacImg from '../assets/asp-removebg-preview.png';
import {
  Thermometer, Sun, Zap, Droplets,
  Lock, Unlock, Bell,
  Lightbulb
} from 'lucide-react';

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

export default function Dashboard() {
  const [acOn, setAcOn] = useState(true);
  const [lightOn, setLightOn] = useState(true);
  const [vacOn, setVacOn] = useState(true);
  const [locked, setLocked] = useState(true);
  const [lightVal, setLightVal] = useState(36);
  const [activeTab, setActiveTab] = useState('Mois');

  const dataMap = {
    Jour: {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      heights: [40, 65, 30, 85, 45, 90, 55]
    },
    Mois: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      heights: [38, 55, 42, 70, 60, 35, 75, 92, 55, 62, 48, 80]
    },
    Années: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
      heights: [60, 40, 80, 50, 95, 70]
    }
  };

  const currentData = dataMap[activeTab];

  return (
    <div style={{
      background: '#f0f2f5',
      minHeight: '100vh',
      padding: 'clamp(12px, 2vw, 20px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(12px, 1.5vw, 16px)',
      fontFamily: "'DM Sans', sans-serif",
      boxSizing: 'border-box',
    }}>

      {/* ====== HEADER ====== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '4px',
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            Bienvenue Alisha
          </h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>
            Gérez votre maison intelligente facilement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'white', width: '42px', height: '42px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer'
          }}>
            <Bell size={20} color="#1a1a2e" />
            <div style={{
              position: 'absolute', top: '2px', right: '2px', background: 'white',
              border: '1.5px solid #f0f2f5', borderRadius: '50%', width: '16px', height: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold'
            }}>1</div>
          </div>

          <div style={{
            background: 'rgb(255, 129, 129)', width: '42px', height: '42px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 153, 153, 0.4)'
          }}>
            <span style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>!</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {[user1, user2, user3].map((img, i) => (
              <div key={i} style={{
                width: '38px', height: '38px', borderRadius: '50%', border: '2px solid white',
                overflow: 'hidden', marginLeft: i === 0 ? '0' : '-12px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 3 - i
              }}>
                <img src={img} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Alisha H.</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ====== STATS + VOICE CONTROL ====== */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '10px',
          flex: 1,
          minWidth: 0,
        }}>
          {[
            { label: 'Temp. intérieure', value: '24°C', icon: <Thermometer size={16} color="#9ca3af" /> },
            { label: 'Temp. extérieure', value: '18°C', icon: <Sun size={16} color="#9ca3af" /> },
            { label: 'Energie consommée', value: '13 kwh', icon: <Zap size={16} color="#9ca3af" /> },
            { label: 'Humidité', value: '75%', icon: <Droplets size={16} color="#9ca3af" /> },
            { label: 'Energie solaire', value: '78 kwh', icon: <Sun size={16} color="#9ca3af" /> },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '16px', padding: '10px 14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {s.icon}
                <span style={{ fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, color: '#1a1a2e' }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: '16px', padding: '0 18px',
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', height: '56px',
          minWidth: '180px', flexShrink: 0,
        }}>
          <div style={{
            background: '#f3f4f6', borderRadius: '50%', width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', flex: 1, whiteSpace: 'nowrap' }}>contrôle vocal</span>
          <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)', flexShrink: 0 }} />
        </div>
      </div>

      {/* ====== MAIN GRID: 3 colonnes ====== */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .live-dot { animation: pulse 1.2s ease-in-out infinite; }
        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="main-grid" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* COL 1: Camera + Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Camera */}
          <div style={{
            borderRadius: 24, overflow: 'hidden', position: 'relative',
            width: '100%', aspectRatio: '16/9',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}>
            <img src={livingRoomImg} alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', top: 14, left: 14, background: '#ef4444', color: 'white',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50,
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <div className="live-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /> LIVE
            </div>
          </div>

          {/* Energy Chart */}
          <div style={{
            background: 'white', borderRadius: 24, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', fontWeight: 600 }}>Aperçu de la situation énergétique</span>
              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, gap: 2 }}>
                {['Jour', 'Mois', 'Années'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7,
                    border: 'none', cursor: 'pointer',
                    background: activeTab === t ? '#687586' : 'transparent',
                    color: activeTab === t ? 'white' : '#1a1a2e'
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 200 }}>
              {currentData.heights.map((h, i) => (
                <div key={i} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, height: '100%', justifyContent: 'flex-end',
                }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: h >= 90 ? '#687586' : '#8DB0C6',
                    borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease',
                  }} />
                  <span style={{ fontSize: 9, color: '#8DB0C6', whiteSpace: 'nowrap' }}>{currentData.labels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COL 2: Climatiseur + Lumière ES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* AC Widget */}
          <div style={{
            background: '#F9F4EF', borderRadius: 24, padding: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>climatiseur</span>
              <Toggle on={acOn} onToggle={() => setAcOn(!acOn)} />
            </div>
            <div style={{ width: '100%', maxWidth: 180, aspectRatio: '1/1' }}>
              <img
                src={climatiseurImg}
                alt="Thermostat Display"
                style={{
                  width: '100%', height: '100%', objectFit: 'contain',
                  opacity: acOn ? 1 : 0.5, transition: 'opacity 0.3s ease',
                }}
              />
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sun size={14} color="#9ca3af" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>AUTO</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>mode auto</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={14} color="#9ca3af" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>137 min</span>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}>refroid.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Light Widget */}
          <div style={{
            background: '#EAEAEA', borderRadius: 24, padding: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '280px',
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Lumière ES</span>
              <Toggle on={lightOn} onToggle={() => setLightOn(!lightOn)} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
              <img
                src={lightImg}
                alt="Lampe ES"
                style={{
                  maxHeight: '150px', objectFit: 'contain',
                  opacity: lightOn ? 1 : 0.4,
                  filter: lightOn ? `drop-shadow(0 0 ${lightVal / 10}px rgba(251, 191, 36, 0.4))` : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <div style={{
              width: '100%', background: '#1a1a2e', borderRadius: 50, height: '45px',
              display: 'flex', alignItems: 'center', padding: '0 10px', position: 'relative', marginTop: 10,
            }}>
              <input
                type="range" min="0" max="100" value={lightVal}
                onChange={(e) => setLightVal(parseInt(e.target.value))}
                style={{ position: 'absolute', width: '90%', left: '5%', zIndex: 3, opacity: 0, cursor: 'pointer', height: '100%' }}
              />
              <div style={{
                position: 'absolute',
                left: `${Math.max(8, Math.min(92, lightVal))}%`,
                transform: 'translateX(-50%)',
                width: '35px', height: '35px', background: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 2, pointerEvents: 'none',
              }}>
                <Lightbulb size={18} color={lightOn ? "#fbbf24" : "#cbd5e1"} />
              </div>
              <span style={{ marginLeft: 'auto', marginRight: 15, color: 'white', fontSize: 13, fontWeight: 600, opacity: 0.5 }}>
                {lightVal}%
              </span>
            </div>
          </div>
        </div>

        {/* COL 3: Serrure + Aspirateur */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Lock Widget */}
          <div style={{
            background: '#EAEAEA', borderRadius: 24, padding: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '320px',
          }}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>serrure de porte</p>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '16px 0' }}>
              <img
                src={lockImg}
                alt="Serrure Connectée"
                style={{
                  maxHeight: '160px', width: 'auto', objectFit: 'contain',
                  opacity: locked ? 1 : 0.7,
                  filter: locked ? 'none' : 'grayscale(50%)',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <div style={{
              width: '100%', background: '#1a1a2e', borderRadius: 50, height: '45px',
              display: 'flex', alignItems: 'center', padding: '0 10px', position: 'relative', marginTop: 10,
            }}>
              <input
                type="range" min="0" max="1" step="1"
                value={locked ? 0 : 1}
                onChange={(e) => setLocked(e.target.value === "0")}
                style={{ position: 'absolute', width: '90%', left: '5%', zIndex: 3, opacity: 0, cursor: 'pointer', height: '100%' }}
              />
              <div style={{
                position: 'absolute',
                left: locked ? '10%' : '90%',
                transform: 'translateX(-50%)',
                width: '35px', height: '35px', background: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 2, pointerEvents: 'none',
              }}>
                {locked ? <Lock size={18} color="#1a1a2e" /> : <Unlock size={18} color="#ef4444" />}
              </div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, opacity: 0.3 }}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 4, height: 4, background: 'white', borderRadius: '50%' }} />)}
              </div>
            </div>
          </div>

          {/* Vacuum Widget */}
          <div style={{
            background: '#EAEAEA', borderRadius: 24, padding: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minHeight: '280px',
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Aspirateur</span>
              <Toggle on={vacOn} onToggle={() => setVacOn(!vacOn)} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '12px 0' }}>
              <img
                src={vacImg}
                alt="Aspirateur Robot"
                style={{
                  maxHeight: '140px', width: 'auto', objectFit: 'contain',
                  opacity: vacOn ? 1 : 0.5,
                  filter: vacOn ? 'none' : 'grayscale(80%)',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <div style={{
              width: '100%', background: '#1a1a2e', borderRadius: 50, padding: '8px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10,
            }}>
              <div style={{
                background: 'white', borderRadius: '12px', padding: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1 }}>69%</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Batterie</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}