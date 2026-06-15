import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';

/**
 * EditDeviceModal — Modal for editing device information.
 * 
 * Props:
 *   - isOpen: boolean
 *   - device: object | null — the device to edit
 *   - onClose: () => void
 *   - onSave: (deviceId, updatedData) => Promise<void>
 *   - isLoading?: boolean
 */
const TYPE_LABELS = {
  ECLAIRAGE: 'Éclairage',
  THERMIQUE: 'Thermique',
  MULTIMEDIA: 'Multimédia',
  MOTORISE: 'Motorisé',
  ASPIRATEUR: 'Aspirateur',
  CAMERA: 'Caméra',
  SECURITE: 'Sécurité',
  PORTE: 'Porte intelligente',
  CAPTEUR: 'Capteur'
};

const SENSOR_TYPES = [
  { value: 'MOUVEMENT', label: 'Mouvement' },
  { value: 'FUMEE', label: 'Fumée' },
  { value: 'HUMIDITE', label: 'Humidité' }
];

const EditDeviceModal = ({ isOpen, device, onClose, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState({
    nomAppareil: '',
    marque: '',
    // Type-specific fields
    typeCapteur: 'MOUVEMENT',
    codePin: '',
    niveauSensibilite: 'MEDIUM'
  });

  useEffect(() => {
    if (device) {
      setFormData({
        nomAppareil: device.nomAppareil || '',
        marque: device.marque || '',
        typeCapteur: device.typeCapteur || 'MOUVEMENT',
        codePin: device.codePin || '',
        niveauSensibilite: device.niveauSensibilite || 'MEDIUM'
      });
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const deviceType = device.typeAppareil?.toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const updateData = {
      nomAppareil: formData.nomAppareil.trim(),
      marque: formData.marque.trim()
    };

    // Add type-specific fields
    if (deviceType === 'CAPTEUR') {
      updateData.typeCapteur = formData.typeCapteur;
    }
    if (deviceType === 'PORTE') {
      updateData.codePin = formData.codePin;
    }
    if (['SECURITE', 'PORTE', 'CAPTEUR', 'CAMERA'].includes(deviceType)) {
      updateData.niveauSensibilite = formData.niveauSensibilite;
    }

    await onSave(device._id || device.id, updateData);
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[250] animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100 flex flex-col items-start animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-6">
          <div>
            <h2 className="text-xl font-black text-gray-800">Modifier l'appareil</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              {TYPE_LABELS[deviceType] || deviceType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          
          {/* Device Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom de l'appareil</label>
            <input
              type="text"
              value={formData.nomAppareil}
              onChange={handleChange('nomAppareil')}
              placeholder="Ex: Lampe du salon"
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Brand */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marque (Optionnel)</label>
            <input
              type="text"
              value={formData.marque}
              onChange={handleChange('marque')}
              placeholder="Ex: Philips, LG..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Sensor Type (only for CAPTEUR) */}
          {deviceType === 'CAPTEUR' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type de capteur</label>
              <select
                value={formData.typeCapteur}
                onChange={handleChange('typeCapteur')}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none disabled:opacity-50"
              >
                {SENSOR_TYPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* PIN Code (only for PORTE) */}
          {deviceType === 'PORTE' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Code PIN (Optionnel)</label>
              <input
                type="text"
                value={formData.codePin}
                onChange={handleChange('codePin')}
                placeholder="Ex: 1234"
                maxLength={8}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-50"
              />
            </div>
          )}

          {/* Sensitivity Level (for security-type devices) */}
          {['SECURITE', 'PORTE', 'CAPTEUR', 'CAMERA'].includes(deviceType) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Niveau de sensibilité</label>
              <select
                value={formData.niveauSensibilite}
                onChange={handleChange('niveauSensibilite')}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HIGH">Élevé</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !formData.nomAppareil.trim()}
            className={`w-full mt-2 bg-[#20242c] hover:bg-[#2c323d] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm cursor-pointer flex items-center justify-center gap-2 ${
              isLoading || !formData.nomAppareil.trim() ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer les modifications
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;
