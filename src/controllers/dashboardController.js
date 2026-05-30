const { Appareil } = require('../models/Appareil');
const User = require('../models/User');

// Récupérer les données pour les 4 composants spécifiques du Dashboard
exports.getDashboardSummary = async (req, res) => {
    try {
        // 1. Récupérer l'utilisateur (via token idéalement)
        const user = await User.findOne().populate('maison');

        // 2. Chercher les 4 appareils spécifiques par leur nom (ou type)
        // On utilise Promise.all pour gagner du temps
        const [clima, light, lock, aspi] = await Promise.all([
            Appareil.findOne({ nomAppareil: /climatiseur/i }),
            Appareil.findOne({ nomAppareil: /Lumière/i }),
            Appareil.findOne({ nomAppareil: /serrure/i }),
            Appareil.findOne({ nomAppareil: /Aspirateur/i })
        ]);

        res.status(200).json({
            user,
            devices: {
                climatiseur: clima || { status: 'HORSLIGNE', temperatureActuelle: 24 },
                lumiere: light || { status: 'HORSLIGNE', intensite: 36 },
                serrure: lock || { estVerrouillee: true },
                aspirateur: aspi || { status: 'HORSLIGNE', chargeBatterie: 69 }
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur Serveur", error: error.message });
    }
};