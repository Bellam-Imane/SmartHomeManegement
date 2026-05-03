import React, { useState } from 'react';
import { Bell } from 'lucide-react'; 

// --- IMPORT DES ASSETS ---
import user1 from '../assets/profile1.jfif';
import user2 from '../assets/profile2.jfif';
import user3 from '../assets/profile3.jfif';
import room from '../assets/liverom.jpeg'; 
import iconsecur from '../assets/sécurisé-removebg-preview.png';
import salon2 from '../assets/salon2.jfif';
import romparent from '../assets/romparent.jfif'; 
import Escalier from '../assets/Escalier.jfif'; 
import cuizin from '../assets/cuizin.jfif'; 
import roomkids from '../assets/roomkids.jfif';
import Capteur_Mouvement from '../assets/Capteur_Mouvement-removebg-preview.png';
import Qualité_de_lair from '../assets/Qualité_de_l_Air-removebg-preview.png';
import Détecteur_Fumée from '../assets/Détecteur_Fumée-removebg-preview.png';
import icon_DEVERROUILLE from '../assets/icon_DÉVERROUILLÉ.png';
import icon_VERROUILLE from '../assets/icon_VERROUILLÉ.png';
import icon_start from '../assets/icon_start.png';

// --- SOUS-COMPOSANTS ---
const Toggle = ({ on, onToggle }) => (
  <div
    onClick={onToggle}
    style={{
      width: 38, height: 22, borderRadius: 50, cursor: 'pointer',
      background: on ? '#22c55e' : '#1E232A',
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

const SensorCard = ({ img, title, subtitle }) => {
  const [isOn, setIsOn] = useState(true);
  return (
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '18px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '10px' 
    }}>
      <div style={{ background: '#f8f9fa', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
      <div>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a2e' }}>{title}</div>
        <div style={{ fontSize: '10px', color: '#9ca3af' }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
        <span style={{ fontSize: '9px', color: isOn ? '#22c55e' : '#1E232A', fontWeight: 'bold' }}>
          {isOn ? 'SÉCURISÉ' : 'NON SÉCURISÉ'}
        </span>
        <Toggle on={isOn} onToggle={() => setIsOn(!isOn)} />
      </div>
    </div>
  );
};

const AirQualityCard = ({ img, title, subtitle, value, score }) => (
  <div style={{ 
    background: 'white', borderRadius: '24px', padding: '18px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)', gridColumn: 'span 2',
    display: 'flex', alignItems: 'center', gap: '15px'
  }}>
    <div style={{ background: '#f8f9fa', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '700', fontSize: '14px' }}>{title}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{subtitle}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>{score}</div>
    </div>
  </div>
);

// (Interactive Lock Card)
const LockCard = ({ name, initialState }) => {
  const [isLocked, setIsLocked] = useState(initialState);

  return (
    <div style={{ 
      background: 'white', borderRadius: '24px', padding: '18px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '110px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img 
            src={isLocked ? icon_VERROUILLE : icon_DEVERROUILLE} 
            alt="lock status" 
            style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
          />
          <img 
            onClick={() => setIsLocked(!isLocked)}
            src={icon_start} 
            alt="power toggle" 
            style={{ width: '20px', height: '20px', cursor: 'pointer', objectFit: 'contain' }} 
          />
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a2e' }}>{name}</div>
        <div style={{ 
          fontSize: '9px', 
          color: isLocked ? '#1a1a2e' : '#ef4444', 
          fontWeight: 'bold', 
          textTransform: 'uppercase' 
        }}>
          {isLocked ? 'VERROUILLÉ' : 'DÉVERROUILLÉ'}
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
const Security = () => {
  const [alarmActive, setAlarmActive] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentCam, setCurrentCam] = useState({
    img: room,
    name: "Salon Principal",
    desc: "Angle de vue : 120° • 4K HDR"
  });

  const usersImages = [user1, user2, user3];
  const changeCamera = (camData) => setCurrentCam(camData);

  return (
    <div style={{
      background: '#f0f2f5', minHeight: '100vh', padding: 'clamp(12px, 2vw, 20px)',
      display: 'flex', flexDirection: 'column', gap: '20px',
      fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Tableau de bord de sécurité</h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>Gérez la sécurité de votre maison intelligente facilement.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '0 18px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', height: '42px' }}>
            <div style={{ background: '#f3f4f6', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>contrôle vocal</span>
            <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Bell size={20} color="#1a1a2e" />
              <div style={{ position: 'absolute', top: '2px', right: '2px', background: 'white', border: '1.5px solid #f0f2f5', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>1</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {usersImages.map((img, i) => (
                <div key={i} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', marginLeft: i === 0 ? '0' : '-12px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 3 - i }}>
                  <img src={img} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SYSTÈME D'ALARME */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>État du Système</h3>
        <div style={{ background: 'white', borderRadius: '35px', padding: '25px 35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 15px 45px rgba(0,0,0,0.08)', border: '1px solid #f8f8f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ width: '75px', height: '75px', background: alarmActive ? '#FF0000' : '#626262', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <img src={iconsecur} alt="Security" style={{ width: '75px', height: '75px', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>Système d'alarme</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: alarmActive ? '#FF0000' : '#626262', fontSize: '20px', fontWeight: '900' }}>{alarmActive ? 'ACTIF' : 'DÉSACTIVÉ'}</span>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{alarmActive ? '• Tous les périmètres sont surveillés.' : '• Le système est au repos.'}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setAlarmActive(true)} style={{ background: alarmActive ? '#FF0000' : '#F2F2F7', color: alarmActive ? 'white' : '#1a1a2e', border: 'none', padding: '14px 45px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' }}>Active</button>
            <button onClick={() => setAlarmActive(false)} style={{ background: !alarmActive ? '#9ca3af' : '#F2F2F7', color: !alarmActive ? 'white' : '#000', border: 'none', padding: '14px 35px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' }}>Désactiver</button>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Flux Caméras</h3>
              <select 
                onChange={(e) => {
                  const val = e.target.value;
                  if(val === 'salon') changeCamera({img: room, name: 'Salon Principal', desc: 'Angle de vue : 120° • 4K HDR'});
                  if(val === 'salon2') changeCamera({img: salon2, name: 'Salon 2', desc: 'Vue panoramique'});
                  if(val === 'parent') changeCamera({img: romparent, name: 'Chambre Parents', desc: 'HD Night Vision'});
                  if(val === 'kids') changeCamera({img: roomkids, name: 'Chambre Enfants', desc: 'Secure view'});
                  if(val === 'cuizin') changeCamera({img: cuizin, name: 'Cuisine', desc: 'Wide angle'});
                  if(val === 'escalier') changeCamera({img: Escalier, name: 'Escalier', desc: 'Motion detection'});
                }}
                style={{ border: 'none', background: 'none', color: '#9ca3af', fontWeight: '600', cursor: 'pointer' }}
              >
                <option value="salon">Salon Principal</option>
                <option value="salon2">Salon 2</option>
                <option value="parent">Chambre Parents</option>
                <option value="kids">Chambre Enfants</option>
                <option value="cuizin">Cuisine</option>
                <option value="escalier">Escalier</option>
              </select>
            </div>
            <div style={{ position: 'relative', borderRadius: '45px', overflow: 'hidden', background: 'black', aspectRatio: '16/11' }}>
              <img src={currentCam.img} alt={currentCam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '25px', left: '25px', background: '#FF0000', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '900' }}>● LIVE</div>
              <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{currentCam.name}</h2>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>{currentCam.desc}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Capteurs Connectés</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <SensorCard img={Capteur_Mouvement} title="Mouvement" subtitle="Cuisine & Entrée" />
              <SensorCard img={Détecteur_Fumée} title="Fumée" subtitle="Étages 1 & 2" />
              <AirQualityCard img={Qualité_de_lair} title="Qualité de l'Air" subtitle="CO2 & Particules" value="Excellent" score="98 AQI" />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: ACCÈS & VERROUILLAGE */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 40px auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700' }}>Accès & Verrouillage</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <LockCard name="Porte d'Entrée" initialState={true} />
          <LockCard name="Porte de Garage" initialState={true} />
          <LockCard name="Porte Fenêtre" initialState={false} />
          <LockCard name="Portail Allée" initialState={true} />
        </div>
      </div>
    </div>
  );
};

export default Security;