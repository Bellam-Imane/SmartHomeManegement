const { Appareil, PorteIntelligent, Capteur, Camera, AppareilSecurite } = require('../models/Appareil');

// ============================================================
// SYSTÈME D'ALARME
// On utilise un Appareil de type SECURITE avec nomAppareil "ALARME_SYSTEME"
// ============================================================

exports.getAlarmStatus = async (req, res) => {
    try {
        const alarm = await AppareilSecurite.findOne({ nomAppareil: 'ALARME_SYSTEME' });
        if (!alarm) {
            return res.status(404).json({ message: "Système d'alarme non trouvé." });
        }
        res.status(200).json({
            id: alarm._id,
            active: alarm.estDeclanche,
            status: alarm.status,
            sensibilite: alarm.niveauSensibilite
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.updateAlarmStatus = async (req, res) => {
    try {
        const { active } = req.body;

        if (typeof active !== 'boolean') {
            return res.status(400).json({ message: "Le champ 'active' doit être un booléen." });
        }

        const alarm = await AppareilSecurite.findOneAndUpdate(
            { nomAppareil: 'ALARME_SYSTEME' },
            { estDeclanche: active, status: active ? 'ENLIGNE' : 'HORSLIGNE' },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: active ? "Alarme activée." : "Alarme désactivée.",
            active: alarm.estDeclanche
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ============================================================
// PORTES INTELLIGENTES
// ============================================================

exports.getAllDoors = async (req, res) => {
    try {
        const doors = await PorteIntelligent.find().select('nomAppareil estVerrouillee status piece');
        res.status(200).json(doors);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.toggleDoorLock = async (req, res) => {
    try {
        const { id } = req.params;
        const { locked } = req.body;

        if (typeof locked !== 'boolean') {
            return res.status(400).json({ message: "Le champ 'locked' doit être un booléen." });
        }

        const door = await PorteIntelligent.findByIdAndUpdate(
            id,
            { estVerrouillee: locked },
            { new: true }
        );

        if (!door) {
            return res.status(404).json({ message: "Porte non trouvée." });
        }

        res.status(200).json({
            message: locked ? "Porte verrouillée." : "Porte déverrouillée.",
            id: door._id,
            nom: door.nomAppareil,
            locked: door.estVerrouillee
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ============================================================
// CAPTEURS (mouvement, fumée, humidité)
// ============================================================

exports.getAllSensors = async (req, res) => {
    try {
        const sensors = await Capteur.find().select(
            'nomAppareil typeCapteur valeurActuelle dernierDetection estDeclanche status'
        );
        res.status(200).json(sensors);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ============================================================
// CAMÉRAS
// ============================================================

exports.getAllCameras = async (req, res) => {
    try {
        const cameras = await Camera.find().select(
            'nomAppareil resolution angleVue estEnregistrement stockageRestant status'
        );
        res.status(200).json(cameras);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};