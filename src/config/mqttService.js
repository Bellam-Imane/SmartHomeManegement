const mqtt = require('mqtt');
const mongoose = require('mongoose');

const { saveSensorData, saveDeviceConsumption } = require('../services/influxService'); 

const MQTT_BROKER = process.env.MQTT_BROKER_URL || process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

const TOPIC_COMMANDES = 'smart/home/appareils/commandes';
const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';
const TOPIC_CLIMA_PUB = "smart/home/climatiseur/mesures"; 
const TOPIC_HUMI_PUB = "smart/home/capteurs/humidite";   
const TOPIC_AIR_PUB = "smart/home/capteurs/air";         
const TOPIC_CONSO_ACK = "smart/home/appareils/consommation"; 

const Appareil = require('../models/Appareil');
const SystemeGestionEnergetique = require('../models/SystemeGestionEnergetique');
const Regle = require('../models/Regle'); 

let client = null;

const initializeMqtt = (io) => {
    console.log(`📡 Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    client = mqtt.connect(MQTT_BROKER, {
        port: Number(MQTT_PORT),
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000
    });

    client.on('connect', () => {
        console.log('✅ MQTT connecté avec succès au Broker !');

        const topicsToSubscribe = [
            TOPIC_TELEMETRIE, 
            TOPIC_COMMANDES, 
            TOPIC_CLIMA_PUB, 
            TOPIC_HUMI_PUB, 
            TOPIC_AIR_PUB, 
            TOPIC_CONSO_ACK
        ];

        topicsToSubscribe.forEach(topic => {
            client.subscribe(topic, { qos: 1 }, (err) => {
                if (!err) console.log(`📥 Topic abonné : ${topic}`);
                else console.error(`❌ Échec d'abonnement au topic ${topic}:`, err.message);
            });
        });
    });

    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            if (topic === TOPIC_COMMANDES) {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 SYNC demandée par un composant matériel");
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
                    await recalculerEnergieGlobale(io);
                }

                if (payload.temperatureActuelle !== undefined) {
                    saveSensorData(appareilActuel.nomAppareil || 'CapteurTemp', 'temperature', Number(payload.temperatureActuelle));
                    await verifierEtExecuterRegles(appareilMisAJour, io);
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
            }

            if (topic === TOPIC_HUMI_PUB && payloadRaw.startsWith("HUMI:")) {
                const humidite = parseFloat(payloadRaw.split(":")[1]);
                if (!isNaN(humidite)) await saveSensorData('dht11_salon', 'humidite', humidite);
            }

            if (topic === TOPIC_AIR_PUB && payloadRaw.startsWith("AIR:")) {
                const ppm = parseFloat(payloadRaw.split(":")[1]);
                if (!isNaN(ppm)) await saveSensorData('mq135_salon', 'qualite_air', ppm);
            }

            if (topic === TOPIC_CONSO_ACK) {
                console.log(`✅ [CONSO ACK] ESP32 confirme la réception -> ${payloadRaw}`);
            }

        } catch (err) {
            console.error(`❌ Erreur critique MQTT [${topic}] :`, err.message);
        }
    });

    client.on('error', (err) => {
        console.error("❌ Erreur de connexion MQTT :", err.message);
    });
};

async function verifierEtExecuterRegles(appareil, io) {
    try {
        const reglesActives = await Regle.find({ etat: true, 'condition.typeAppareil': appareil.type });

        for (let regle of reglesActives) {
            let conditionRemplie = false;
            const valeurActuelle = Number(appareil.temperatureActuelle);
            const seuil = Number(regle.condition.valeurSeuil);
            const op = regle.condition.operateur;

            if (op === '>' && valeurActuelle > seuil) conditionRemplie = true;
            if (op === '<' && valeurActuelle < seuil) conditionRemplie = true;
            if (op === '==' && valeurActuelle === seuil) conditionRemplie = true;
            if (op === '!=' && valeurActuelle !== seuil) conditionRemplie = true;

            if (conditionRemplie) {
                console.log(`🤖 [AUTOMATION] Règle "${regle.nomRegle}" validée !`);
                const idCible = regle.action.appareilCible.toString();
                const commandeAAffecter = regle.action.commande; 
                const isCommandeOn = commandeAAffecter === 'ON';

                const appareilCibleMAJ = await Appareil.findByIdAndUpdate(
                    idCible,
                    { 
                        status: isCommandeOn ? 'ENLIGNE' : 'HORSLIGNE', 
                        consommationActuelle: isCommandeOn ? 65 : 0 
                    },
                    { new: true }
                );

                if (appareilCibleMAJ) {
                    if (client && client.connected) {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: idCible,
                            action: "TOGGLE",
                            valeur: isCommandeOn
                        }));
                    }

                    if (io) {
                        io.emit('appareil_update', {
                            deviceId: idCible,
                            payload: {
                                status: appareilCibleMAJ.status,
                                consommationActuelle: appareilCibleMAJ.consommationActuelle
                            }
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error("❌ Erreur au niveau du moteur d'automatisation :", err.message);
    }
}

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