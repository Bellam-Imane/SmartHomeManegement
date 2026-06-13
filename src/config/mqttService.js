const mqtt = require('mqtt');
const mongoose = require('mongoose');

<<<<<<< HEAD
// Importations des services d'archivage InfluxDB
const { saveSensorData, saveDeviceConsumption } = require('../services/influxService'); 
=======
// Broker URL from .env — defaults to EMQX public broker (Wokwi ESP32 compatible)
const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
const TOPIC_CLIMA_PUB = "smart/home/climatiseur/mesures"; // Température DHT11
const TOPIC_HUMI_PUB = "smart/home/capteurs/humidite";   // Humidité
const TOPIC_AIR_PUB = "smart/home/capteurs/air";         // Qualité de l'air (CO2 / PPM)
const TOPIC_CONSO_ACK = "smart/home/appareils/consommation"; // ESP32 acknowledgment
>>>>>>> fe1878892fac09c41be180a9d6a9c6e4d21addbf

// Chargement des modèles nécessaires
const Appareil = require('../models/Appareil');
const SystemeGestionEnergetique = require('../models/SystemeGestionEnergetique');
const Regle = require('../models/Regle'); // 💡 Ajout du modèle Regle pour l'automation événementielle

<<<<<<< HEAD
// Configurations du Broker MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

// Topic central pour les commandes ESP32 (utilisé par Wokwi et fakeEsp32)
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

// Topic telemetry pour la réception des données des capteurs
const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';

/**
 * 📡 INITIALISATION DU CLIENT MQTT GLOBAL
 * S'occupe de la connexion, des souscriptions et du routage des messages
 */
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

        // Souscription aux flux de télémétrie (Flux montant)
        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`📥 Topic abonné : ${TOPIC_TELEMETRIE}`);
        });

        // Souscription aux flux de commandes (Pour la synchronisation bidirectionnelle)
        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`🔄 Topic commandes : ${TOPIC_COMMANDES}`);
=======
const initializeMqtt = () => {
    console.log(`⏳ Connexion au Broker MQTT: ${MQTT_BROKER}...`);
    mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
        console.log(`📡 ✅ Connecté avec succès au Broker MQTT (${MQTT_BROKER}) !`);

        mqttClient.subscribe(TOPIC_CLIMA_PUB, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`📥 Abonné avec succès au flux DHT11 : ${TOPIC_CLIMA_PUB}`);
            } else {
                console.error(`❌ Échec d'abonnement au topic ${TOPIC_CLIMA_PUB}:`, err.message);
            }
>>>>>>> fe1878892fac09c41be180a9d6a9c6e4d21addbf
        });

        // Nouveaux topics Phase 3
        mqttClient.subscribe(TOPIC_HUMI_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`📥 Abonné au flux Humidité : ${TOPIC_HUMI_PUB}`);
        });
        mqttClient.subscribe(TOPIC_AIR_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`📥 Abonné au flux Qualité Air : ${TOPIC_AIR_PUB}`);
        });

        // ESP32 consumption acknowledgment
        mqttClient.subscribe(TOPIC_CONSO_ACK, { qos: 1 }, (err) => {
            if (!err) console.log(`📥 Abonné à l'accusé de réception : ${TOPIC_CONSO_ACK}`);
        });
    });

    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            // ── 🔄 TRAITEMENT DE LA SYNCHRONISATION INITIALE DE L'ESP32 ──
            if (topic === TOPIC_COMMANDES) {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 SYNC demandée par un composant matériel (Wokwi/FakeESP)");

                    if (mongoose.connection.readyState !== 1) return;

                    const appareilsEnBase = await Appareil.find({}, 'status');

<<<<<<< HEAD
                    // Renvoi de l'état actuel de la DB à l'appareil demandeur
                    appareilsEnBase.forEach(app => {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: app._id.toString(),
                            action: "SYNC_STATUS",
                            valeur: app.status === 'ENLIGNE'
                        }));
                    });
=======
                            if (tempAmbiante > 26.0) {
                                nouvelleCible = 18;
                            } else if (tempAmbiante < 20.0) {
                                nouvelleCible = 28;
                            } else {
                                nouvelleCible = 24;
                            }
>>>>>>> fe1878892fac09c41be180a9d6a9c6e4d21addbf

                    return;
                }
            }

            // ── ⚡ TRAITEMENT DE LA TÉLÉMÉTRIE EN TEMPS RÉEL (CAPTEURS) ──
            if (topic === TOPIC_TELEMETRIE) {
                let data;
                try { data = JSON.parse(payloadRaw); } catch (err) { return; }

                const { deviceId, payload } = data;

                // Validation stricte des données reçues du hardware
                if (!deviceId || !payload || !mongoose.Types.ObjectId.isValid(deviceId)) return;

                const appareilActuel = await Appareil.findById(deviceId);
                if (!appareilActuel) return;

                const updateQuery = {};

                // Calcul et incrémentation de l'énergie consommée (Wh)
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

                // Sauvegarde de la télémétrie fraîche dans MongoDB
                const appareilMisAJour = await Appareil.findByIdAndUpdate(
                    deviceId,
                    updateQuery,
                    { returnDocument: 'after' }
                );

                // Transfert optionnel des métriques vers InfluxDB (Séries temporelles)
                if (payload.consommationActuelle !== undefined) {
                    saveDeviceConsumption(deviceId, appareilActuel.type || 'AppareilInconnu', Number(payload.consommationActuelle));
                }

                if (payload.temperatureActuelle !== undefined) {
                    saveSensorData(appareilActuel.nomAppareil || 'CapteurTemp', 'temperature', Number(payload.temperatureActuelle));
                    
                    // 💡 ENGINE AUTOMATION : Vérification instantanée des règles à chaque rapport thermique
                    await verifierEtExecuterRegles(appareilMisAJour, io);
                }

                // Diffusion immédiate vers le Frontend via Socket.io
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

                // Recalcul du tableau de bord d'énergie global si la consommation change
                if (payload.consommationActuelle !== undefined) {
                    await recalculerEnergieGlobale(io);
                }
            }

        } catch (err) {
            console.error(`❌ Erreur critique MQTT [${topic}] :`, err.message);
        }
    });
};

/**
 * 🧠 MOTEUR D'AUTOMATION ÉVÉNEMENTIELLE (REGLES DU CAPTEUR)
 * Analyse les règles actives et envoie l'ordre MQTT approprié en cas de validation du seuil
 */
async function verifierEtExecuterRegles(appareil, io) {
    try {
        // Extraction des règles actives correspondantes au type d'appareil émetteur
        const reglesActives = await Regle.find({ etat: true, 'condition.typeAppareil': appareil.type });

        for (let regle of reglesActives) {
            let conditionRemplie = false;
            
            const valeurActuelle = Number(appareil.temperatureActuelle);
            const seuil = Number(regle.condition.valeurSeuil);
            const op = regle.condition.operateur;

            // Évaluation mathématique de l'opérateur de la règle
            if (op === '>' && valeurActuelle > seuil) conditionRemplie = true;
            if (op === '<' && valeurActuelle < seuil) conditionRemplie = true;
            if (op === '==' && valeurActuelle === seuil) conditionRemplie = true;
            if (op === '!=' && valeurActuelle !== seuil) conditionRemplie = true;

            // Si le seuil est franchi, exécution immédiate de l'action configurée
            if (conditionRemplie) {
                console.log(`🤖 [AUTOMATION] Règle "${regle.nomRegle}" validée par le hardware !`);
                
                const idCible = regle.action.appareilCible.toString();
                const commandeAAffecter = regle.action.commande; // 'ON' ou 'OFF'
                const isCommandeOn = commandeAAffecter === 'ON';

                // 1️⃣ Mise à jour de l'état de l'appareil cible dans MongoDB
                const appareilCibleMAJ = await Appareil.findByIdAndUpdate(
                    idCible,
                    { 
                        status: isCommandeOn ? 'ENLIGNE' : 'HORSLIGNE', 
                        consommationActuelle: isCommandeOn ? 65 : 0 // Simulation d'une charge par défaut à l'allumage
                    },
                    { new: true }
                );

                if (appareilCibleMAJ) {
                    // 2️⃣ Publication de la commande sur le Broker MQTT pour Wokwi / fakeEsp32
                    if (client && client.connected) {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: idCible,
                            action: "TOGGLE",
                            valeur: isCommandeOn
                        }));
                        console.log(`🔌 [MQTT PUSH] Ordre automatique envoyé à l'appareil ${idCible} => ${commandeAAffecter}`);
                    }

                    // 3️⃣ Synchronisation flash de l'interface utilisateur (React UI) via Socket.io
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
<<<<<<< HEAD
    } catch (err) {
        console.error("❌ Erreur au niveau du moteur d'automatisation (Regles) :", err.message);
=======

        // --- Phase 3 : Nouveaux capteurs ---

        // Topic Humidité : payload attendu ex: "HUMI:65.3"
        if (topic === TOPIC_HUMI_PUB) {
            if (payload.startsWith("HUMI:")) {
                const humidite = parseFloat(payload.split(":")[1]);
                if (!isNaN(humidite)) {
                    await saveSensorData('dht11_salon', 'humidite', humidite);
                }
            }
        }

        // Topic Qualité de l'air : payload attendu ex: "AIR:420"
        if (topic === TOPIC_AIR_PUB) {
            if (payload.startsWith("AIR:")) {
                const ppm = parseFloat(payload.split(":")[1]);
                if (!isNaN(ppm)) {
                    await saveSensorData('mq135_salon', 'qualite_air', ppm);
                }
            }
        }

        // Topic Consommation : ESP32 acknowledgment (payload: "OK")
        if (topic === TOPIC_CONSO_ACK) {
            console.log(`✅ [CONSO ACK] ESP32 confirme la réception -> ${payload}`);
        }
    });

    mqttClient.on('error', (err) => {
        console.error("❌ Erreur de connexion MQTT :", err.message);
    });
};

const publishMessage = (topic, message) => {
    if (!mqttClient || !mqttClient.connected) {
        console.error("⚠️ Impossible d'envoyer le message : le client MQTT n'est pas connecté.");
        return;
>>>>>>> fe1878892fac09c41be180a9d6a9c6e4d21addbf
    }
}

/**
 * ── RECALCUL DE L'ÉNERGIE GLOBALE DE LA MAISON ──
 */
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

/**
 * ── ENVOI FLUSH DE SÉCURITÉ MQTT (PUBLISH EXTRÈNE) ──
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