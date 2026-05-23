import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import VoiceControlButton from '../components/VoiceControlButton';

// --- IMPORT DES ASSETS ---
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

// استيراد ملف الترجمة المتوافق مع الـ Webpack بدون Context
const { translations } = require("../translations");

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

const SensorCard = ({ img, title, subtitle, tSecured, tUnsecured }) => {
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
          {isOn ? tSecured : tUnsecured}
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

const LockCard = ({ name, initialState, tLocked, tUnlocked }) => {
  const [isLocked, setIsLocked] = useState(initialState);
  return (
    <div style={{
      background: 'white', borderRadius: '24px', padding: '18px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '110px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img src={isLocked ? icon_VERROUILLE : icon_DEVERROUILLE} alt="lock status" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        <img
          onClick={() => setIsLocked(!isLocked)}
          src={icon_start}
          alt="power toggle"
          style={{ width: '20px', height: '20px', cursor: 'pointer', objectFit: 'contain' }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontWeight: '700', fontSize: '13px', color: '#1a1a2e' }}>{name}</div>
        <div style={{ fontSize: '9px', color: isLocked ? '#1a1a2e' : '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {isLocked ? tLocked : tUnlocked}
        </div>
      </div>
    </div>
  );
};

const Security = () => {
  const [language, setLanguage] = useState("Français");
  const [alarmActive, setAlarmActive] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate(); 

  // مراقبة تغيير اللغة فـ localStorage بحال notifications.jsx ديالك بالضبط
  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem("language");
      if (savedLang) setLanguage(savedLang);
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = translations[language] || translations["Français"];
  const secData = t.securityData || translations["Français"].securityData;

  const [currentCam, setCurrentCam] = useState({
    img: room,
    id: 'salon' 
  });

  const changeCamera = (camData) => setCurrentCam(camData);

  
  const currentCamName = secData.cams[currentCam.id]?.name || secData.cams['salon'].name;
  const currentCamDesc = secData.cams[currentCam.id]?.desc || secData.cams['salon'].desc;

  return (
    <div style={{
      background: '#f0f2f5', minHeight: '100vh', padding: 'clamp(12px, 2vw, 20px)',
      display: 'flex', flexDirection: 'column', gap: '20px',
      fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box'
    }} dir={language === "العربية" ? "rtl" : "ltr"}>

      <style>{`@keyframes blinker { 50% { opacity: 0; } }`}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{t.securityPanelTitle}</h1>
          <p style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: '#9ca3af', margin: '4px 0 0 0' }}>{t.securityPanelDesc}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <VoiceControlButton />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          </div>
        </div>
      </div>

      {/* SYSTÈME D'ALARME */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '15px' }}>{t.systemStatusTitle}</h3>
        <div style={{ background: 'white', borderRadius: '35px', padding: '25px 35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 15px 45px rgba(0,0,0,0.08)', border: '1px solid #f8f8f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ width: '75px', height: '75px', background: alarmActive ? '#FF0000' : '#626262', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <img src={iconsecur} alt="Security" style={{ width: '75px', height: '75px', objectFit: 'contain' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{t.alarmSystemLabel}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: alarmActive ? '#FF0000' : '#626262', fontSize: '20px', fontWeight: '900' }}>{alarmActive ? t.alarmActiveStatus : t.alarmInactiveStatus}</span>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{alarmActive ? t.alarmActiveDesc : t.alarmInactiveDesc}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setAlarmActive(true)} style={{ background: alarmActive ? '#FF0000' : '#F2F2F7', color: alarmActive ? 'white' : '#1a1a2e', border: 'none', padding: '14px 45px', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' }}>{language === "العربية" ? "تفعيل" : "Active"}</button>
            <button onClick={() => setAlarmActive(false)} style={{ background: !alarmActive ? '#9ca3af' : '#F2F2F7', color: !alarmActive ? 'white' : '#000', border: 'none', padding: '14px 35px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' }}>{language === "العربية" ? "تعطيل" : "Désactiver"}</button>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>{t.cameraFeedTitle}</h3>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'salon') changeCamera({ img: room, id: 'salon' });
                  if (val === 'salon2') changeCamera({ img: salon2, id: 'salon2' });
                  if (val === 'parent') changeCamera({ img: romparent, id: 'parent' });
                  if (val === 'kids') changeCamera({ img: roomkids, id: 'kids' });
                  if (val === 'cuizin') changeCamera({ img: cuizin, id: 'cuizin' });
                  if (val === 'escalier') changeCamera({ img: Escalier, id: 'escalier' });
                }}
                style={{ border: 'none', background: 'none', color: '#9ca3af', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value="salon">{secData.cams.salon.name}</option>
                <option value="salon2">{secData.cams.salon2.name}</option>
                <option value="parent">{secData.cams.parent.name}</option>
                <option value="kids">{secData.cams.kids.name}</option>
                <option value="cuizin">{secData.cams.cuizin.name}</option>
                <option value="escalier">{secData.cams.escalier.name}</option>
              </select>
            </div>

            {/* CAMERA FEED */}
            <div style={{
              position: isFullScreen ? 'fixed' : 'relative', top: 0, left: 0,
              width: isFullScreen ? '100vw' : '100%', height: isFullScreen ? '100vh' : 'auto',
              aspectRatio: isFullScreen ? 'none' : '16/11', zIndex: isFullScreen ? 9999 : 1,
              borderRadius: isFullScreen ? 0 : '45px', overflow: 'hidden', background: 'black'
            }}>
              <img src={currentCam.img} alt={currentCamName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '25px', [language === "العربية" ? 'right' : 'left']: '25px', background: '#FF0000', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px', animation: 'blinker 2s linear infinite' }}>●</span> {t.live}
              </div>
              <div style={{ position: 'absolute', bottom: '30px', [language === "العربية" ? 'right' : 'left']: '30px', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{currentCamName}</h2>
                <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>{currentCamDesc}</p>
              </div>
              <button onClick={() => setIsFullScreen(!isFullScreen)} style={{ position: 'absolute', bottom: '30px', [language === "العربية" ? 'left' : 'right']: '30px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '12px 25px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                {isFullScreen ? t.closeFullScreen : t.viewLive}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>{t.connectedSensorsTitle}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <SensorCard img={Capteur_Mouvement} title={secData.sensors.mouvement.title} subtitle={secData.sensors.mouvement.subtitle} tSecured={t.sensorSecured} tUnsecured={t.sensorUnsecured} />
              <SensorCard img={Détecteur_Fumée} title={secData.sensors.fumee.title} subtitle={secData.sensors.fumeeSub || secData.sensors.fumee.subtitle} tSecured={t.sensorSecured} tUnsecured={t.sensorUnsecured} />
              <AirQualityCard img={Qualité_de_lair} title={secData.sensors.air.title} subtitle={secData.sensors.air.subtitle} value={secData.sensors.air.value} score={secData.sensors.air.score} />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 40px auto' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700' }}>{t.accessLockTitle}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <LockCard name={secData.locks.entree} initialState={true} tLocked={t.lockLocked} tUnlocked={t.lockUnlocked} />
          <LockCard name={secData.locks.garage} initialState={true} tLocked={t.lockLocked} tUnlocked={t.lockUnlocked} />
          <LockCard name={secData.locks.fenetre} initialState={false} tLocked={t.lockLocked} tUnlocked={t.lockUnlocked} />
          <LockCard name={secData.locks.allee} initialState={true} tLocked={t.lockLocked} tUnlocked={t.lockUnlocked} />
        </div>
      </div>
    </div>
  );
};

export default Security;