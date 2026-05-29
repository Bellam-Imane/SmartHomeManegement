const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Pré-loading sécurisé des modèles Mongoose déjà enregistrés
const Appareil = mongoose.model('Appareil');
const SystemeGestionEnergetique = mongoose.model('SystemeGestionEnergetique');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

/**
 * 🔌 INITIALISATION DU SERVICE MQTT
 * @param {Object} io - Instance Socket.io pour la communication temps réel
 */
const initializeMqtt = (io) => {

    console.log(`📡 Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    client = mqtt.connect(MQTT_BROKER, {
        port: MQTT_PORT,
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000
    });

    // ======================================================
    // ✅ CONNEXION RÉUSSIE ET ABONNEMENT AUX FLUX
    // ======================================================
    client.on('connect', () => {
        console.log('✅ MQTT connecté avec succès au Broker');

        const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';
        const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`📥 Topic abonné avec succès : ${TOPIC_TELEMETRIE}`);
        });

        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`🔄 Topic abonné avec succès pour la synchronisation : ${TOPIC_COMMANDES}`);
        });
    });

    // ======================================================
    // 📩 RÉCEPTION, ENREGISTREMENT ET PUSH DES DONNÉES
    // ======================================================
    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            // ── 🔄 INTERCEPTOR : DEMANDE DE SYNCHRONISATION INITIALE ──
            if (topic === 'smart/home/appareils/commandes') {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 [MQTT SYNC] Demande de synchronisation reçue du Fake ESP32...");
                    
                    // Vérification de sécurité sur l'état de la connexion MongoDB
                    if (mongoose.connection.readyState !== 1) {
                        console.warn("⚠️ [MQTT SYNC] MongoDB n'est pas encore prêt. Le Fake ESP32 utilisera son fallback.");
                        return;
                    }

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

            // ── ⚡ HANDLER : TRAITEMENT DES SENSORS ET ENERGIE ──
            if (topic === 'smart/home/appareils/telemetrie') {
                let data;
                try { data = JSON.parse(payloadRaw); } catch (err) { return; }

                const { deviceId, payload } = data;

                if (!deviceId || !payload || !mongoose.Types.ObjectId.isValid(deviceId)) return;

                const appareilActuel = await Appareil.findById(deviceId);
                if (!appareilActuel) return;

                const updateQuery = {};
                
                // Calcul de l'accumulation de l'énergie (Wh)
                if (payload.consommationActuelle !== undefined) {
                    const watts = payload.consommationActuelle;
                    const energieConsommeeDurantIntervalle = (watts * 10) / 3600;
                    const ancienneConsommationCumulee = appareilActuel.consommationCumulee || 0;

                    updateQuery.consommationCumulee = ancienneConsommationCumulee + energieConsommeeDurantIntervalle;
                    updateQuery.consommationActuelle = watts; 
                }

                if (payload.temperatureActuelle !== undefined) updateQuery.temperatureActuelle = payload.temperatureActuelle;
                if (payload.position !== undefined) updateQuery.position = payload.position;

                const appareilMisAJour = await Appareil.findByIdAndUpdate(
                    deviceId, 
                    updateQuery, 
                    { returnDocument: 'after' }
                );

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

                if (payload.consommationActuelle !== undefined) {
                    await recalculerEnergieGlobale(io);
                }
            }

        } catch (err) {
            console.error(`❌ Erreur globale MQTT [${topic}] :`, err.message);
        }
    });
};

async function recalculerEnergieGlobale(io) {
    try {
        const appareils = await Appareil.find({});
        const totalCumuleMaison = appareils.reduce((sum, a) => sum + (a.consommationCumulee || 0), 0);
        let systeme = await SystemeGestionEnergetique.findOne();
        if (!systeme) systeme = new SystemeGestionEnergetique();

        systeme.consommationTotale = Math.round(totalCumuleMaison * 100) / 100;
        systeme.balanceEnergetique = (systeme.productionTotale || 0) - systeme.consommationTotale;
        systeme.dateDerniereMiseAJour = new Date();
        await systeme.save();

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