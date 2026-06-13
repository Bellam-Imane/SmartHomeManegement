const User = require('../models/User');
const { Appareil } = require('../models/Appareil');
const Notification = require('../models/Notifications');
const { sendSecurityAlertEmail } = require('../services/emailService');
const { logNotification, logDeviceEvent } = require('../services/historyService');
const { getLatestSensorData } = require('../services/influxService');
const { publishMessage } = require('../config/mqttService');
const { getAppareilFilter } = require('../utils/userScope');

// Map lock keys to expected MongoDB device names for PORTE sync
const LOCK_DEVICE_NAMES = {
    entree: "Porte d'Entrée",
    garage: "Porte de Garage",
    fenetre: "Porte Fenêtre",
    allee: "Portail Allée"
};

/**
 * @desc    Récupérer l'état actuel de la sécurité + AQI live depuis InfluxDB
 * @route   GET /api/security
 * @access  Private
 */
exports.getSecurityStatus = async (req, res) => {
    try {
        console.log("[DEBUG] Fetching status for user ID:", req.user?.id);
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const securityData = user.preferences?.securitySettings || {};

        // --- Live Air Quality from InfluxDB ---
        let airQuality = null;
        try {
            const aqiValue = await getLatestSensorData('qualite_air', '-1h');
            if (aqiValue !== null) {
                airQuality = {
                    value: Math.round(aqiValue),
                    score: aqiValue <= 50 ? 'Excellent' : aqiValue <= 100 ? 'Bon' : aqiValue <= 200 ? 'Modéré' : 'Mauvais'
                };
                console.log(`[Security] Live AQI from InfluxDB: ${airQuality.value} (${airQuality.score})`);
            }
        } catch (aqiErr) {
            console.warn("[Security] Could not fetch AQI from InfluxDB:", aqiErr.message);
        }

        res.status(200).json({ ...securityData, airQuality });
    } catch (error) {
        console.error("[GET ERROR]:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Mettre à jour un élément de sécurité (Alarme, Verrous, Capteurs)
 *          + Sync PORTE devices in MongoDB + Audit trail in PostgreSQL
 * @route   PUT /api/security
 * @access  Private
 */
exports.updateSecurityStatus = async (req, res) => {
    try {
        console.log("[DEBUG] Body reçu:", req.body);
        console.log("[DEBUG] User ID du Token:", req.user?.id);

        const { type, name, value } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            console.error("[ERROR] Utilisateur introuvable en DB");
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        if (!user.preferences) user.preferences = {};
        if (!user.preferences.securitySettings) {
            user.preferences.securitySettings = { locks: {}, sensors: {} };
        }
        if (!user.preferences.securitySettings.sensors) {
            user.preferences.securitySettings.sensors = {};
        }

        // ==========================================
        // 1. DUAL LOCK SYNCHRONIZATION
        // ==========================================
        let syncedDeviceId = null;
        if (type === 'locks' && name) {
            const expectedDeviceName = LOCK_DEVICE_NAMES[name];

            // SECURITE : Filtrer uniquement les appareils de la maison de l'utilisateur
            const userFilter = await getAppareilFilter(userId);

            // Try exact name match first (scoped to user's maison)
            let doorDevice = null;
            if (expectedDeviceName) {
                doorDevice = await Appareil.findOne({
                    ...userFilter,
                    typeAppareil: 'PORTE',
                    nomAppareil: expectedDeviceName
                });
            }

            // Fallback: first PORTE or MOTORISE door/lock device (scoped to user)
            if (!doorDevice) {
                doorDevice = await Appareil.findOne({ ...userFilter, typeAppareil: 'PORTE' })
                    || await Appareil.findOne({ ...userFilter, typeAppareil: 'MOTORISE', nomAppareil: /serrure|porte|lock/i });
            }

            if (doorDevice) {
                const oldLockValue = doorDevice.estVerrouillee;
                doorDevice.estVerrouillee = value;
                await doorDevice.save();
                syncedDeviceId = String(doorDevice._id);
                console.log(`[Security] 🔒 Synced PORTE device "${doorDevice.nomAppareil}" (${syncedDeviceId}) -> estVerrouillee: ${value}`);

                // Log device-level event to PostgreSQL historique_donnees
                await logDeviceEvent(
                    syncedDeviceId,
                    'CHANGEMENT_ETAT_VERROU',
                    String(oldLockValue),
                    String(value)
                );

                // MQTT: publish lock state to ESP32 with door identifier
                const lockTopic = 'smart/home/portes';
                const doorName = name.toUpperCase(); // ENTREE, GARAGE, FENETRE, ALLEE
                const lockPayload = value ? `LOCK:${doorName}` : `UNLOCK:${doorName}`;
                publishMessage(lockTopic, lockPayload);
                console.log(`[Security] 📡 MQTT published -> ${lockTopic} : ${lockPayload}`);
            } else {
                console.log(`[Security] ⚠️ No PORTE device found for lock "${name}" — skipping device sync`);
            }

            user.preferences.securitySettings.locks[name] = value;
        } else if (type === 'alarmActive') {
            user.preferences.securitySettings.alarmActive = value;
            // MQTT: publish alarm state to ESP32
            const alarmPayload = value ? 'ON' : 'OFF';
            publishMessage('smart/home/alarme', alarmPayload);
            console.log(`[Security] 📡 MQTT published -> smart/home/alarme : ${alarmPayload}`);
        } else if (type === 'sensors' && name) {
            user.preferences.securitySettings.sensors[name] = value;
            // MQTT: publish sensor state to ESP32
            const sensorPayload = value ? 'ON' : 'OFF';
            publishMessage(`smart/home/capteur/${name}`, sensorPayload);
            console.log(`[Security] 📡 MQTT published -> smart/home/capteur/${name} : ${sensorPayload}`);
        }

        console.log("[DEBUG] Tentative de sauvegarde...");
        user.markModified('preferences.securitySettings');
        await user.save();
        console.log("[DEBUG] Sauvegarde réussie !");

        // ==========================================
        // 2. NOTIFICATIONS (PostgreSQL audit + MongoDB + Socket.IO)
        // ==========================================
        try {
            let titre = null, message = null;

            if (type === 'alarmActive') {
                const action = value ? "Système d'alarme ACTIVÉ" : "Système d'alarme DÉSACTIVÉ";
                titre = "Changement Alarme";
                message = action;
                await logNotification(userId, titre, message);
                console.log(`[Security] 📝 Audit log: ${action}`);
            } else if (type === 'locks' && name) {
                const lockLabel = LOCK_DEVICE_NAMES[name] || name;
                const action = value ? `${lockLabel} VERROUILLÉ` : `${lockLabel} DÉVERROUILLÉ`;
                titre = "Changement Verrou";
                message = action;
                await logNotification(userId, titre, message);
                console.log(`[Security] 📝 Audit log: ${action}`);
            } else if (type === 'sensors' && name) {
                const action = value ? `Capteur "${name}" activé` : `Capteur "${name}" désactivé`;
                titre = "Changement Capteur";
                message = action;
                await logNotification(userId, titre, message);
                console.log(`[Security] 📝 Audit log: ${action}`);
            }

            // Créer la notification MongoDB + push Socket.IO
            if (titre && message) {
                const notif = await Notification.create({
                    titre,
                    message,
                    type: 'SECURITE',
                    categorie: 'SECURITE',
                    priorite: type === 'alarmActive' ? 'HIGH' : 'MEDIUM',
                    utilisateur: userId
                });

                // Push en temps réel via Socket.IO
                const io = req.app.get('io');
                if (io) {
                    io.to(`user:${userId}`).emit('new_notification', {
                        _id: notif._id,
                        titre: notif.titre,
                        message: notif.message,
                        type: notif.type,
                        categorie: notif.categorie,
                        priorite: notif.priorite,
                        dateHeure: notif.dateHeure,
                        estLue: false
                    });
                    // Also update Sidebar badge count
                    io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
                }
            }
        } catch (logErr) {
            console.error("[Security] ⚠️ Notification creation failed (non-blocking):", logErr.message);
        }

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
        const alertTitre = "🚨 Alerte de Sécurité";
        let alertMessage;

        if (isEmailAllowed) {
            // Fire email in background (don't block response on SMTP timeout)
            sendSecurityAlertEmail(
                user.email,
                "[SmartHome] ALERTE: Événement suspect détecté !",
                `Le système a détecté une alerte de sécurité à votre domicile.<br>
                 <b>Date:</b> ${new Date().toLocaleString('fr-FR')}<br>
                 Veuillez vérifier l'application.`
            ).catch(err => console.error("[Email] Background send failed:", err.message));
            alertMessage = "Événement suspect détecté à votre domicile.";
            await logNotification(userId, alertTitre, alertMessage);
        } else {
            alertMessage = "Événement suspect détecté (envoi email désactivé).";
            await logNotification(userId, alertTitre, alertMessage);
        }

        // Create MongoDB notification + Socket.IO push
        try {
            const notif = await Notification.create({
                titre: alertTitre,
                message: alertMessage,
                type: 'SECURITE',
                categorie: 'SECURITE',
                priorite: 'CRITICAL',
                utilisateur: userId
            });

            const io = req.app.get('io');
            if (io) {
                io.to(`user:${userId}`).emit('new_notification', {
                    _id: notif._id,
                    titre: notif.titre,
                    message: notif.message,
                    type: notif.type,
                    categorie: notif.categorie,
                    priorite: notif.priorite,
                    dateHeure: notif.dateHeure,
                    estLue: false
                });
                io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
            }
        } catch (notifErr) {
            console.error("[Security] ⚠️ Alert notification creation failed (non-blocking):", notifErr.message);
        }

        return res.json({
            message: isEmailAllowed
                ? "Alerte déclenchée. Émail envoyé avec succès."
                : "Alerte déclenchée, mais l'envoi d'émail est désactivé."
        });

    } catch (error) {
        console.error("Erreur triggerSecurityAlert:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
