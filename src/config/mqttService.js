const mqtt = require('mqtt');
const mongoose = require('mongoose');

// =========================================================================
// 📊 IMPORTATION DES SERVICES INFLUXDB (AJOUTÉ POUR LA PERSISTANCE TIME-SERIES)
// =========================================================================
const { saveSensorData, saveDeviceConsumption } = require('../services/influxService'); 
// ⚠️ Note : Assurez-vous que le chemin vers 'influxService' est correct selon votre structure.

// Chargement sécurisé des modèles Mongoose pré-enregistrés
const Appareil = mongoose.model('Appareil');
const SystemeGestionEnergetique = mongoose.model('SystemeGestionEnergetique');

// Configuration des variables d'environnement pour le Broker MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

/**
 * 🔌 INITIALISATION DU SERVICE MQTT
 * Connecte le serveur au broker et gère les abonnements aux différents flux.
 * @param {Object} io - Instance Socket.io pour la communication temps réel avec le Frontend
 */
const initializeMqtt = (io) => {

    console.log(`📡 Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    // Établissement de la connexion avec le broker EMQX
    client = mqtt.connect(MQTT_BROKER, {
        port: MQTT_PORT,
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000 // Tentative de reconnexions automatiques toutes les 5 secondes
    });

    // =========================================================================
    // ✅ ÉVÉNEMENT : CONNEXION RÉUSSIE ET ABONNEMENT AUX TOPICS
    // =========================================================================
    client.on('connect', () => {
        console.log('✅ MQTT connecté avec succès au Broker');

        const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';
        const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

        // S'abonner au flux des données des capteurs (Télémesures)
        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`📥 Topic abonné avec succès : ${TOPIC_TELEMETRIE}`);
        });

        // S'abonner au flux des commandes et demandes de synchronisation
        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`🔄 Topic abonné avec succès pour la synchronisation : ${TOPIC_COMMANDES}`);
        });
    });

    // =========================================================================
    // 📩 ÉVÉNEMENT : RÉCEPTION, TRAITEMENT ET PERSISTANCE DES DONNÉES
    // =========================================================================
    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            // ── 🔄 INTERCEPTOR : GESTION DE LA SYNCHRONISATION INITIALE (ASK_STATUS) ──
            if (topic === 'smart/home/appareils/commandes') {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 [MQTT SYNC] Demande de synchronisation reçue du Fake ESP32...");
                    
                    // Vérification de sécurité sur l'état de la connexion MongoDB
                    if (mongoose.connection.readyState !== 1) {
                        console.warn("⚠️ [MQTT SYNC] MongoDB n'est pas prêt. Le Fake ESP32 utilisera son fallback.");
                        return;
                    }

                    // Récupération des états actuels depuis MongoDB pour synchroniser l'ESP32
                    const appareilsEnBase = await Appareil.find({}, 'status');
                    
                    appareilsEnBase.forEach(app => {
                        client.publish('smart/home/appareils/commandes', JSON.stringify({
                            deviceId: app._id.toString(),
                            action: "SYNC_STATUS",
                            valeur: app.status === 'ENLIGNE'
                        }));
                    });
                    return;
                }
            }

            // ── ⚡ HANDLER : TRAITEMENT DES DONNÉES DE TÉLÉMÉTRIE (CAPTEURS & ÉNERGIE) ──
            if (topic === 'smart/home/appareils/telemetrie') {
                let data;
                try { data = JSON.parse(payloadRaw); } catch (err) { return; }

                const { deviceId, payload } = data;

                // Validation structurelle de la requête reçue
                if (!deviceId || !payload || !mongoose.Types.ObjectId.isValid(deviceId)) return;

                const appareilActuel = await Appareil.findById(deviceId);
                if (!appareilActuel) return;

                const updateQuery = {};
                
                // Calcul de l'accumulation de l'énergie consommée (Wh)
                if (payload.consommationActuelle !== undefined) {
                    const watts = payload.consommationActuelle;
                    const energieConsommeeDurantIntervalle = (watts * 10) / 3600; // Intervalle de 10 secondes
                    const ancienneConsommationCumulee = appareilActuel.consommationCumulee || 0;

                    updateQuery.consommationCumulee = ancienneConsommationCumulee + energieConsommeeDurantIntervalle;
                    updateQuery.consommationActuelle = watts; 
                }

                // Récupération des autres données dynamiques du payload
                if (payload.temperatureActuelle !== undefined) updateQuery.temperatureActuelle = payload.temperatureActuelle;
                if (payload.position !== undefined) updateQuery.position = payload.position;

                // Mise à jour de l'état en temps réel dans MongoDB
                const appareilMisAJour = await Appareil.findByIdAndUpdate(
                    deviceId, 
                    updateQuery, 
                    { returnDocument: 'after' }
                );

                // =========================================================================
                // 🚀 DOUBLE PERSISTANCE : ENVOI DES DONNÉES VERS INFLUXDB (TIME-SERIES)
                // =========================================================================
                if (payload.consommationActuelle !== undefined) {
                    // Sauvegarde de la consommation électrique instantanée (Watts)
                    saveDeviceConsumption(
                        deviceId, 
                        appareilActuel.type || 'AppareilInconnu', 
                        Number(payload.consommationActuelle)
                    );
                }

                if (payload.temperatureActuelle !== undefined) {
                    // Sauvegarde des métriques environnementales (Température)
                    saveSensorData(
                        appareilActuel.nom || 'CapteurTemp', 
                        'temperature', 
                        Number(payload.temperatureActuelle)
                    );
                }
                // =========================================================================

                // Diffusion des données mises à jour vers le Frontend via WebSockets (Socket.io)
                if (io) {
                    io.emit('appareil_update', {
                        deviceId: deviceId,
                        payload: {
                            consommationActuelle: appareilMisAJour.consommationActuelle,
                            consommationCumulee: Math.round(appareilMisAJour.consommationCumulee * 100) / 100,
                            temperatureActuelle: appareilMisAJour.temperatureActuelle,
                            position: appareilMisAJour.position
                        }
                    });
                }

                // Recalcul de l'état énergétique global de la maison si la consommation change
                if (payload.consommationActuelle !== undefined) {
                    await recalculerEnergieGlobale(io);
                }
            }

        } catch (err) {
            console.error(`❌ Erreur globale MQTT [${topic}] :`, err.message);
        }
    });
};

/**
 * 📊 RECALCUL DE L'ÉNERGIE GLOBALE DE L'HABITATION
 * Fait la somme des consommations cumulées et met à jour la balance énergétique.
 * @param {Object} io - Instance Socket.io pour notifier le client de la mise à jour globale
 */
async function recalculerEnergieGlobale(io) {
    try {
        const appareils = await Appareil.find({});
        const totalCumuleMaison = appareils.reduce((sum, a) => sum + (a.consommationCumulee || 0), 0);
        
        let systeme = await SystemeGestionEnergetique.findOne();
        if (!systeme) systeme = new SystemeGestionEnergetique();

        // Calculs et arrondi à deux décimales
        systeme.consommationTotale = Math.round(totalCumuleMaison * 100) / 100;
        systeme.balanceEnergetique = (systeme.productionTotale || 0) - systeme.consommationTotale;
        systeme.dateDerniereMiseAJour = new Date();
        await systeme.save();

        // Notification temps réel du changement énergétique global vers l'interface React
        if (io) {
            io.emit('global_energy_update', {
                consommationTotale: systeme.consommationTotale,
                balanceEnergetique: systeme.balanceEnergetique
            });
        }
    } catch (err) {
        console.error("❌ Erreur recalcul global :", err.message);
    }
}

/**
 * 📤 EXPORTATION DES FONCTIONS DE PUBLICATION MQTT
 */
const publishMqttMessage = (topic, message) => {
    if (!client || !client.connected) return;
    client.publish(topic, message, { qos: 1 });
};

module.exports = {
    initializeMqtt,
    publishMqttMessage,
    publishMessage: publishMqttMessage,
    publish: publishMqttMessage
};