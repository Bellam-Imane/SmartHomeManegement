const mqtt = require('mqtt');
const mongoose = require('mongoose');

const { saveSensorData, saveDeviceConsumption } = require('../services/influxService'); 

const Appareil = require('../models/Appareil');
const SystemeGestionEnergetique = require('../models/SystemeGestionEnergetique');

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

// Topic central pour les commandes ESP32
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

// Topic telemetry inchangé
const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';

const initializeMqtt = (io) => {
    console.log(`📡 Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    client = mqtt.connect(MQTT_BROKER, {
        port: MQTT_PORT,
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000
    });

    client.on('connect', () => {
        console.log('✅ MQTT connecté avec succès au Broker');

        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`📥 Topic abonné : ${TOPIC_TELEMETRIE}`);
        });

        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`🔄 Topic commandes : ${TOPIC_COMMANDES}`);
        });
    });

    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {

            // ── 🔄 SYNC ESP32 ──
            if (topic === TOPIC_COMMANDES) {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 SYNC demandée");

                    if (mongoose.connection.readyState !== 1) return;

                    const appareilsEnBase = await Appareil.find({}, 'status');

                    appareilsEnBase.forEach(app => {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: app._id.toString(),
                            action: "SYNC_STATUS",
                            valeur: app.status === 'ENLIGNE'
                        }));
                    });

                    return;
                }
            }

            // ── ⚡ TELEMETRIE ──
            if (topic === TOPIC_TELEMETRIE) {
                let data;
                try { data = JSON.parse(payloadRaw); } catch (err) { return; }

                const { deviceId, payload } = data;

                if (!deviceId || !payload || !mongoose.Types.ObjectId.isValid(deviceId)) return;

                const appareilActuel = await Appareil.findById(deviceId);
                if (!appareilActuel) return;

                const updateQuery = {};

                if (payload.consommationActuelle !== undefined) {
                    const watts = payload.consommationActuelle;
                    const energie = (watts * 10) / 3600;
                    const old = appareilActuel.consommationCumulee || 0;

                    updateQuery.consommationCumulee = old + energie;
                    updateQuery.consommationActuelle = watts;
                }

                if (payload.temperatureActuelle !== undefined)
                    updateQuery.temperatureActuelle = payload.temperatureActuelle;

                if (payload.position !== undefined)
                    updateQuery.position = payload.position;

                const appareilMisAJour = await Appareil.findByIdAndUpdate(
                    deviceId,
                    updateQuery,
                    { returnDocument: 'after' }
                );

                if (payload.consommationActuelle !== undefined) {
                    saveDeviceConsumption(deviceId, appareilActuel.type || 'AppareilInconnu', Number(payload.consommationActuelle));
                }

                if (payload.temperatureActuelle !== undefined) {
                    saveSensorData(appareilActuel.nomAppareil || 'CapteurTemp', 'temperature', Number(payload.temperatureActuelle));
                }

                if (io) {
                    io.emit('appareil_update', {
                        deviceId,
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
            console.error(`❌ Erreur MQTT [${topic}] :`, err.message);
        }
    });
};

// ── GLOBAL ENERGY ──
async function recalculerEnergieGlobale(io) {
    try {
        const appareils = await Appareil.find({});
        const total = appareils.reduce((s, a) => s + (a.consommationCumulee || 0), 0);

        let systeme = await SystemeGestionEnergetique.findOne();
        if (!systeme) systeme = new SystemeGestionEnergetique();

        systeme.consommationTotale = Math.round(total * 100) / 100;
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

// ── PUBLISH ──
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