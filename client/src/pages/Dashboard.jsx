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
  ChevronLeft, ChevronRight, Lightbulb, Cpu, Flame
} from 'lucide-react';

// Composant de switch réutilisable
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
  const [floorOn, setFloorOn] = useState(true);
  const [locked, setLocked] = useState(true);
  const [lightVal, setLightVal] = useState(36);
  const [floorTemp, setFloorTemp] = useState(19);
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
      background: '#f0f2f5', minHeight: '100vh', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Section En-tête (Header) avec style mis à jour selon image_306678.jpg */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Bienvenue Alisha</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0 0' }}>Gérez votre maison intelligente facilement.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Icône Notification avec cercle blanc et ombre */}
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

          {/* Icône Alerte (Point d'exclamation rouge) */}
          <div style={{ 
            background: 'rgb(255, 129, 129)', width: '42px', height: '42px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 153, 153, 0.4)'
          }}>
            <span style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>!</span>
          </div>

          {/* Groupe d'avatars utilisateurs superposés */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
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

          {/* Nom de profil et indicateur de menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>Alisha H.</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Ligne des Stats et Contrôle Vocal (Mise à jour selon image_2ffd7e.jpg) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        {/* Conteneur des petites cartes de statistiques */}
        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
          {[
            { label: 'Temp. intérieure', value: '24°C', icon: <Thermometer size={16} color="#9ca3af" /> },
            { label: 'Temp. extérieure', value: '18°C', icon: <Sun size={16} color="#9ca3af" /> },
            { label: 'Energie consommée', value: '13 kwh', icon: <Zap size={16} color="#9ca3af" /> },
            { label: 'Humidité', value: '75%', icon: <Droplets size={16} color="#9ca3af" /> },
            { label: 'Energie solaire', value: '78 kwh', icon: <Sun size={16} color="#9ca3af" /> },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flex: 1 }}>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 500, margin: '0 0 4px 0', whiteSpace: 'nowrap' }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {s.icon}
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Carte de contrôle vocal avec icône Microphone */}
        <div style={{ 
          background: 'white', borderRadius: '16px', padding: '0 18px', 
          display: 'flex', alignItems: 'center', gap: '12px', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', height: '56px', minWidth: '220px' 
        }}>
          {/* Cercle gris avec icône micro SVG */}
          <div style={{ 
            background: '#f3f4f6', borderRadius: '50%', width: '38px', height: '38px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' 
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', flex: 1 }}>contrôle vocal</span>
          {/* Indicateur de statut (point vert) */}
          <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)' }} />
        </div>
      </div>

      {/* Grille principale : Caméra et Panneaux de contrôle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        
        {/* Colonne Gauche : Caméra Live et Graphique */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fenêtre de la caméra (Dimensions 70% largeur) */}
          <div style={{ 
            borderRadius: 24, overflow: 'hidden', position: 'relative', 
            height: '50%', width: '70%', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' 
          }}>
            <img src={livingRoomImg} alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div className="animate-pulse" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%' }} /> LIVE
            </div>
          </div>
          {/* --- Section Graphe + Lumière ES --- */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '70%' }}></div>
          {/* Graphique d'énergie avec filtres temporels */}
          <div style={{ background: 'white', borderRadius: 24, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',flex: 1 ,width: '70%',height:'60%'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Aperçu de la situation énergétique</span>
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
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 260 }}>
              {currentData.heights.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${h}%`, background: h >= 90 ? '#687586' : '#8DB0C6', borderRadius: '6px 6px 0 0', transition: 'height 0.3s ease' }} />
                  <span style={{ fontSize: 9, color: '#8DB0C6' }}>{currentData.labels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Climatiseur et Serrure */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: 16, alignItems: 'stretch' }}>
        {/* Widget Climatiseur  */}
        <div style={{ 
            background: '#F9F4EF', 
            borderRadius: 24, 
            padding: 20, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 15,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            height: '50%', 
            width:'90%',
            marginLeft: '-230px', 
            zIndex: 10
        }}>
       {/* En-tête : Titre et Bouton de commutation */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>climatiseur</span>
        <Toggle on={acOn} onToggle={() => setAcOn(!acOn)} />
      </div>

      {/* Visualisation du Thermostat (Cercle central) */}
      <div style={{ 
        width: 200, // Taille ajustée pour correspondre à l'image
        height: 200, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative',
      }}>
      {/* Affichage de l'image du thermostat depuis le dossier assets */}
      <div style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '50%', 
        overflow: 'hidden',
        opacity: acOn ? 1 : 0.5, // Réduction de l'opacité si le climatiseur est éteint
        transition: 'opacity 0.3s ease'
      }}>
      <img 
        src={climatiseurImg} 
        alt="Thermostat Display"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  </div>

  {/* Section Pied de page : Informations sur le mode et le temps */}
  <div style={{ 
    width: '100%', 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: 'auto', 
    paddingTop: 10 
  }}>
    {/* Mode Automatique */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sun size={14} color="#9ca3af" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>AUTO</span>
        <span style={{ fontSize: 9, color: '#9ca3af' }}>mode automatique</span>
      </div>
    </div>

    {/* Temps de refroidissement */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Zap size={14} color="#9ca3af" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a2e' }}>137 min</span>
        <span style={{ fontSize: 9, color: '#9ca3af' }}>refroidissement</span>
      </div>
    </div>
  </div>
</div>

       {/* Widget Serrure de porte - Contrôle interactif par Drag/Scroll */}
        <div style={{ 
            background: '#EAEAEA', 
            borderRadius: 24, 
            padding: 20, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            height: '360px', 
            width: '100%', 
            maxWidth: '300px',
            position: 'relative'
        }}>
            {/* En-tête : Titre fixe */}
            <div style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>serrure de porte</p>
            </div>

            {/* Zone centrale : Image de la serrure */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%'
            }}>
                <img 
                    src={lockImg} 
                    alt="Serrure Connectée" 
                    style={{ 
                        height: '220px', 
                        width: 'auto',
                        objectFit: 'contain',
                        opacity: locked ? 1 : 0.7,
                        filter: locked ? 'none' : 'grayscale(50%)', // Effet visuel quand c'est déverrouillé
                        transition: 'all 0.3s ease'
                    }} 
                />
            </div>

            {/* Barre de contrôle : Slider interactif (Drag and Drop) */}
            <div style={{ 
                width: '100%', 
                background: '#1a1a2e', 
                borderRadius: 50, 
                height: '45px',
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 10px',
                position: 'relative',
                marginTop: 10
            }}>
                {/* Input range invisible pour gérer le mouvement (Scroll) */}
                <input 
                    type="range"
                    min="0"
                    max="1"
                    step="1"
                    value={locked ? 0 : 1} // 0 = Verrouillé (gauche), 1 = Déverrouillé (droite)
                    onChange={(e) => setLocked(e.target.value === "0")}
                    style={{
                        position: 'absolute',
                        width: '90%',
                        left: '5%',
                        zIndex: 3,
                        opacity: 0,
                        cursor: 'pointer',
                        height: '100%'
                    }}
                />

                {/* Curseur blanc (Boule) qui suit l'état (Locked/Unlocked) */}
                <div style={{ 
                    position: 'absolute',
                    left: locked ? '10%' : '90%', // Déplacement dynamique
                    transform: 'translateX(-50%)',
                    width: '35px', 
                    height: '35px', 
                    background: 'white', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Animation fluide
                    zIndex: 2,
                    pointerEvents: 'none'
                }}>
                    {locked ? <Lock size={18} color="#1a1a2e" /> : <Unlock size={18} color="#ef4444" />}
                </div>

                {/* Décoration centrale (Points de guidage) */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, opacity: 0.3 }}>
                    {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 4, height: 4, background: 'white', borderRadius: '50%' }} />)}
                </div>
            </div>
        </div>
    </div>
  </div>
      
      {/* Barre d'appareils connectés (Bas de page) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        
        {/* Widget Lumière ES - Contrôle d'éclairage avec curseur interactif */}
        <div style={{ 
            background: '#EAEAEA',              // Couleur de fond grise
            borderRadius: 24,                    // Bordures arrondies
            padding: 20,                         // Espace intérieur
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '360px',                     // Hauteur fixe du widget
            width: '100%',
            maxWidth: '240px',                   // Largeur maximale ajustée
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', // Ombre légère
            
            /* Positionnement relatif pour placer le widget à côté du graphe */
            marginTop: '-360px',                 // Remonte le widget vers le haut
            marginLeft: '570px',                 // Déplace le widget vers la droite
            position: 'relative', 
            zIndex: 10                           // S'assure que le widget est au premier plan
        }}>
            {/* En-tête : Titre et Interrupteur (Toggle) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Lumière ES</span>
                <Toggle on={lightOn} onToggle={() => setLightOn(!lightOn)} />
            </div>

            {/* Zone centrale : Image de la lampe avec effet de lueur dynamique */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                    src={lightImg} 
                    alt="Lampe ES" 
                    style={{ 
                        height: '220px', 
                        objectFit: 'contain', 
                        opacity: lightOn ? 1 : 0.4, // Moins opaque si éteint
                        /* Effet visuel de lumière basé sur la valeur du slider (lightVal) */
                        filter: lightOn ? `drop-shadow(0 0 ${lightVal/10}px rgba(251, 191, 36, 0.4))` : 'none',
                        transition: 'all 0.3s ease'
                    }} 
                />
            </div>

            {/* Barre de contrôle : Glissière (Slider) pour l'intensité */}
            <div style={{ 
                width: '100%', 
                background: '#1a1a2e',           // Fond sombre de la barre
                borderRadius: 50, 
                height: '45px',
                display: 'flex', 
                alignItems: 'center', 
                padding: '0 10px',
                position: 'relative',
                marginTop: 10
            }}>
                {/* Input invisible pour gérer le glissement au doigt/souris */}
                <input 
                    type="range"
                    min="0"
                    max="100"
                    value={lightVal}
                    onChange={(e) => setLightVal(parseInt(e.target.value))}
                    style={{
                        position: 'absolute',
                        width: '90%',
                        left: '5%',
                        zIndex: 3,
                        opacity: 0,              // Rendu invisible pour ne laisser que le visuel personnalisé
                        cursor: 'pointer',
                        height: '100%'
                    }}
                />

                {/* Visuel du curseur (Bouton blanc qui bouge) */}
                <div style={{ 
                    position: 'absolute',
                    /* Calcule la position gauche en fonction de la valeur de l'intensité */
                    left: `${Math.max(8, Math.min(92, lightVal))}%`, 
                    transform: 'translateX(-50%)',
                    width: '35px', 
                    height: '35px', 
                    background: 'white', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 2,
                    pointerEvents: 'none'        // Ignore les clics pour laisser l'input en dessous agir
                }}>
                    <Lightbulb size={18} color={lightOn ? "#fbbf24" : "#cbd5e1"} />
                </div>

                {/* Affichage numérique du pourcentage d'intensité */}
                <span style={{ marginLeft: 'auto', marginRight: 15, color: 'white', fontSize: 13, fontWeight: 600, opacity: 0.5 }}>
                    {lightVal}%
                </span>
            </div>
        </div>
        {/* Widget Contrôle Aspirateur  */}
        <div style={{ 
            background: '#EAEAEA', // Fond gris clair comme les autres widgets
            borderRadius: 24, 
            padding: 20, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            height: '360px', // Hauteur fixe pour l'alignement
            width: '100%',
            maxWidth: '300px',
            marginTop: '-360px',                 // Remonte le widget (ajuste selon tes besoins)
            marginLeft: '108px',

            
        }}>
            {/* En-tête : Titre du widget et Switch ON/OFF */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Aspirateur</span>
                <Toggle on={vacOn} onToggle={() => setVacOn(!vacOn)} />
            </div>

            {/* Zone centrale : Image de l'aspirateur réaliste (remplace l'icône Cpu) */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%'
            }}>
                <img 
                    src={vacImg} 
                    alt="Aspirateur Robot" 
                    style={{ 
                        height: '160px', // Taille ajustée pour l'espace central
                        width: 'auto',
                        objectFit: 'contain',
                        // Effet visuel : l'aspirateur s'estompe s'il est éteint
                        opacity: vacOn ? 1 : 0.5,
                        filter: vacOn ? 'none' : 'grayscale(80%)',
                        transition: 'all 0.3s ease' // Animation douce pour le changement d'état
                    }} 
                />
            </div>

            {/* Pied de page*/}
            <div style={{ 
                width: '100%', 
                background: '#1a1a2e', 
                borderRadius: 50, 
                padding: '8px 12px',   
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginTop: 10
            }}>
                {/* Côté gauche : icône de batterie au milieu d’un petit carré blanc*/}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '6px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <Zap size={16} color="#fbbf24" fill="#fbbf24" />
                </div>

                {/* Côté droit : pourcentage et écriture*/}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                        69%
                    </span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                        Batterie
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}