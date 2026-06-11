const User = require('../models/User');
const { sendSecurityAlertEmail } = require('../services/emailService');
const { logNotification } = require('../services/historyService');

/**
 * @desc    Récupérer l'état actuel de la sécurité
 * @route   GET /api/security
 * @access  Private
 */
exports.getSecurityStatus = async (req, res) => {
    try {
        console.log("[DEBUG] Fetching status for user ID:", req.user?.id);
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const securityData = user.preferences?.securitySettings || {};
        res.status(200).json(securityData);
    } catch (error) {
        console.error("[GET ERROR]:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Mettre à jour un élément de sécurité (Alarme, Verrous, Capteurs)
 * @route   PUT /api/security
 * @access  Private
 */
exports.updateSecurityStatus = async (req, res) => {
    try {
        console.log("[DEBUG] Body reçu:", req.body);
        console.log("[DEBUG] User ID du Token:", req.user?.id);

        const { type, name, value } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            console.error("[ERROR] Utilisateur introuvable en DB");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.preferences) user.preferences = {};
        if (!user.preferences.securitySettings) user.preferences.securitySettings = { locks: {}, sensors: {} };

        if (type === 'alarmActive') {
            user.preferences.securitySettings.alarmActive = value;
        } else if (type === 'locks' && name) {
            user.preferences.securitySettings.locks[name] = value;
        } else if (type === 'sensors' && name) {
            user.preferences.securitySettings.sensors[name] = value;
        }

        console.log("[DEBUG] Tentative de sauvegarde...");
        user.markModified('preferences.securitySettings');
        await user.save();
        console.log("[DEBUG] Sauvegarde réussie !");

        res.status(200).json(user.preferences.securitySettings);
    } catch (error) {
        console.error("[CRITICAL ERROR]:", error);
        res.status(500).json({ message: "Erreur serveur", detail: error.message });
    }
};

/**
 * @desc    Déclencher une alerte de sécurité et envoyer un e-mail
 * @route   POST /api/security/trigger-alert
 * @access  Private
 */
exports.triggerSecurityAlert = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isEmailAllowed = user.preferences?.notifications?.security?.email ?? true;

        if (isEmailAllowed) {
            // Fire email in background (don't block response on SMTP timeout)
            sendSecurityAlertEmail(
                user.email,
                "[SmartHome] ALERTE: Événement suspect détecté !",
                `Le système a détecté une alerte de sécurité à votre domicile.<br>
                 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}<br>
                 Veuillez vérifier l'application.`
            ).catch(err => console.error("[Email] Background send failed:", err.message));
            // PHASE 4 : Persist security alert to PostgreSQL
            console.log(`[DEBUG] triggerSecurityAlert -> userId: "${userId}" | type: ${typeof userId} | length: ${String(userId).length}`);
            await logNotification(userId, "Alerte de Sécurité", "Événement suspect détecté à votre domicile.");
            return res.json({ message: "Alerte déclenchée. Émail envoyé avec succès." });
        } else {
            // PHASE 4 : Persist security alert even if email is disabled
            console.log(`[DEBUG] triggerSecurityAlert (no email) -> userId: "${userId}" | type: ${typeof userId} | length: ${String(userId).length}`);
            await logNotification(userId, "Alerte de Sécurité", "Événement suspect détecté (envoi email désactivé).");
            return res.json({ message: "Alerte déclenchée, mais l'envoi d'émail est désactivé." });
        }

    } catch (error) {
        console.error("Erreur triggerSecurityAlert:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
