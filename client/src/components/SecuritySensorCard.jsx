import React from 'react';
import { Shield, Lock, Unlock, Eye, Flame, Droplets, Activity, Wifi, WifiOff } from 'lucide-react';
import DeviceMenu from './DeviceMenu';

/**
 * SecuritySensorCard — handles SECURITE, PORTE, and CAPTEUR device types
 * Displays status, sensor readings, and allows lock/unlock or trigger toggle.
 */

const SENSOR_ICONS = {
  MOUVEMENT: Eye,
  FUMEE: Flame,
  HUMIDITE: Droplets,
};

const SENSOR_LABELS = {
  MOUVEMENT: 'Mouvement',
  FUMEE: 'Fumée',
  HUMIDITE: 'Humidité',
};

function SecurityDevice({ device, onUpdate, onEditDevice, onDeleteDevice }) {
  const isOnline = device.status === 'ENLIGNE';
  const isTriggered = device.estDeclanche;

  const handleToggle = () => {
    onUpdate(device._id, { estDeclanche: !isTriggered });
  };

  return (
    <div className={`rounded-2xl p-5 border transition-all ${isTriggered ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTriggered ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          <Shield size={20} />
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-gray-400" />}
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isTriggered ? 'text-red-600' : 'text-gray-400'}`}>
            {isTriggered ? 'DÉCLENCHÉ' : 'NORMAL'}
          </span>
          <DeviceMenu
            deviceName={device.nomAppareil}
            onEdit={() => onEditDevice?.(device)}
            onDelete={() => onDeleteDevice?.(device._id)}
          />
        </div>
      </div>
      <h4 className="font-bold text-sm text-gray-800">{device.nomAppareil}</h4>
      <p className="text-xs text-gray-400 mt-0.5">Sensibilité: {device.niveauSensibilite || 'MEDIUM'}</p>
      <button
        onClick={handleToggle}
        className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-colors ${
          isTriggered ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {isTriggered ? 'Réinitialiser' : 'Tester l\'alarme'}
      </button>
    </div>
  );
}

function DoorDevice({ device, onUpdate, onEditDevice, onDeleteDevice }) {
  const isOnline = device.status === 'ENLIGNE';
  const isLocked = device.estVerrouillee;

  const handleToggle = () => {
    onUpdate(device._id, { estVerrouillee: !isLocked });
  };

  return (
    <div className={`rounded-2xl p-5 border transition-all ${isLocked ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLocked ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
          {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-gray-400" />}
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLocked ? 'text-green-600' : 'text-amber-600'}`}>
            {isLocked ? 'VERROUILLÉ' : 'DÉVERROUILLÉ'}
          </span>
          <DeviceMenu
            deviceName={device.nomAppareil}
            onEdit={() => onEditDevice?.(device)}
            onDelete={() => onDeleteDevice?.(device._id)}
          />
        </div>
      </div>
      <h4 className="font-bold text-sm text-gray-800">{device.nomAppareil}</h4>
      <p className="text-xs text-gray-400 mt-0.5">Porte intelligente</p>
      <button
        onClick={handleToggle}
        className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-colors ${
          isLocked ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isLocked ? 'Déverrouiller' : 'Verrouiller'}
      </button>
    </div>
  );
}

function SensorDevice({ device, onEditDevice, onDeleteDevice }) {
  const isOnline = device.status === 'ENLIGNE';
  const isTriggered = device.estDeclanche;
  const sensorType = device.typeCapteur || 'MOUVEMENT';
  const Icon = SENSOR_ICONS[sensorType] || Activity;

  return (
    <div className={`rounded-2xl p-5 border transition-all ${isTriggered ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTriggered ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
          <Icon size={20} />
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-gray-400" />}
          <DeviceMenu
            deviceName={device.nomAppareil}
            onEdit={() => onEditDevice?.(device)}
            onDelete={() => onDeleteDevice?.(device._id)}
          />
        </div>
      </div>
      <h4 className="font-bold text-sm text-gray-800">{device.nomAppareil}</h4>
      <p className="text-xs text-gray-400 mt-0.5">Capteur {SENSOR_LABELS[sensorType] || sensorType}</p>
      <div className="mt-3 flex items-center justify-between">
        {device.valeurActuelle !== undefined && device.valeurActuelle !== null && (
          <span className={`text-lg font-extrabold ${isTriggered ? 'text-orange-600' : 'text-gray-800'}`}>
            {device.valeurActuelle}
            <span className="text-xs font-normal text-gray-400 ml-1">
              {sensorType === 'HUMIDITE' ? '%' : sensorType === 'FUMEE' ? 'ppm' : ''}
            </span>
          </span>
        )}
        {isTriggered && (
          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">ALERTE</span>
        )}
      </div>
      {device.dernierDetection && (
        <p className="text-[10px] text-gray-300 mt-2">
          Dernière détection: {new Date(device.dernierDetection).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
        </p>
      )}
    </div>
  );
}

export default function SecuritySensorCard({ devices, onUpdateAppareil, onEditDevice, onDeleteDevice, className }) {
  if (!devices || devices.length === 0) return null;

  const securites = devices.filter(d => d.typeAppareil === 'SECURITE');
  const portes = devices.filter(d => d.typeAppareil === 'PORTE');
  const capteurs = devices.filter(d => d.typeAppareil === 'CAPTEUR');

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      {(securites.length > 0 || portes.length > 0 || capteurs.length > 0) && (
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sécurité & Capteurs</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {portes.map(d => <DoorDevice key={d._id} device={d} onUpdate={onUpdateAppareil} onEditDevice={onEditDevice} onDeleteDevice={onDeleteDevice} />)}
        {securites.map(d => <SecurityDevice key={d._id} device={d} onUpdate={onUpdateAppareil} onEditDevice={onEditDevice} onDeleteDevice={onDeleteDevice} />)}
        {capteurs.map(d => <SensorDevice key={d._id} device={d} onEditDevice={onEditDevice} onDeleteDevice={onDeleteDevice} />)}
      </div>
    </div>
  );
}
