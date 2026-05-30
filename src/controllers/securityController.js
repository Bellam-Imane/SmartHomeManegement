// src/controllers/securityController.js
const User = require('../models/User'); 
const { sendSecurityAlertEmail } = require('../services/emailService');

exports.getAlarmStatus = async (req, res) => {
    res.json({ message: "Status de l'alarme récupéré" });
};

exports.updateAlarmStatus = async (req, res) => {
    res.json({ message: "Alarme mise à jour" });
};

/**
 * @desc    Déclencher une alerte de sécurité et envoyer un e-mail selon les préférences de l'utilisateur
 * @route   POST /api/security/trigger-alert (ou selon votre route)
 * @access  Private
 */
exports.triggerSecurityAlert = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Récupérer les préférences de l'utilisateur sauvegardées depuis la page Settings (MongoDB)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier si le toggle "Alertes de Sécurité" (Email) est activé dans la base de données
        const isEmailAllowed = user.preferences?.notifications?.security?.email ?? true;

        if (isEmailAllowed) {
            // Si le toggle est activé (true) -> Envoyer un e-mail réel via Nodemailer
            await sendSecurityAlertEmail(
                user.email,
                "⚠️ [SmartHome] ALERTE: Événement suspect détecté !",
                `Le système a détecté une alerte de sécurité à votre domicile.<br>
                 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}<br>
                 Veuillez vérifier l'application.`
            );
            return res.json({ message: "Alerte déclenchée. Émail envoyé avec succès (Toggle activé)." });
        } else {
            // Si le toggle est désactivé (false) -> Le système bloque l'envoi de l'e-mail
            console.log("🔒 Toggle désactivé, aucun e-mail envoyé.");
            return res.json({ message: "Alerte déclenchée, mais l'envoi d'émail est bloqué par l'utilisateur (Toggle désactivé)." });
        }

    } catch (error) {
        console.error("Erreur triggerSecurityAlert:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getAllDoors = async (req, res) => { res.json({ message: "Liste des portes récupérée" }); };
exports.toggleDoorLock = async (req, res) => { res.json({ message: "Verrouillage modifié" }); };
exports.getAllSensors = async (req, res) => { res.json({ message: "Capteurs récupérés" }); };
exports.getAllCameras = async (req, res) => { res.json({ message: "Caméras récupérées" }); };