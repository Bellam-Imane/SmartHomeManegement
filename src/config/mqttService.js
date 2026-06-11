// config/mqttService.js
const mqtt = require('mqtt');
const { Appareil } = require('../models/Appareil'); // Importation correcte (destructuring) du modèle parent
const { saveSensorData } = require('../services/influxService');

const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const TOPIC_CLIMA_PUB = "smart/home/climatiseur/mesures"; // Température DHT11
const TOPIC_HUMI_PUB = "smart/home/capteurs/humidite";   // Humidité
const TOPIC_AIR_PUB = "smart/home/capteurs/air";         // Qualité de l'air (CO2 / PPM)

let mqttClient = null;

const initializeMqtt = () => {
    console.log("⏳ Connexion au Broker MQTT HiveMQ en cours...");
    mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
        console.log("📡 ✅ Connecté avec succès au Broker MQTT (HiveMQ) !");

        mqttClient.subscribe(TOPIC_CLIMA_PUB, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`📥 Abonné avec succès au flux DHT11 : ${TOPIC_CLIMA_PUB}`);
            } else {
                console.error(`❌ Échec d'abonnement au topic ${TOPIC_CLIMA_PUB}:`, err.message);
            }
        });

        // Nouveaux topics Phase 3
        mqttClient.subscribe(TOPIC_HUMI_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`📥 Abonné au flux Humidité : ${TOPIC_HUMI_PUB}`);
        });
        mqttClient.subscribe(TOPIC_AIR_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`📥 Abonné au flux Qualité Air : ${TOPIC_AIR_PUB}`);
        });
    });

    mqttClient.on('message', async (topic, message) => {
        const payload = message.toString();
        console.log(`✉️ Message MQTT reçu sur [${topic}] -> ${payload}`);

        if (topic === TOPIC_CLIMA_PUB) {
            if (payload.startsWith("TEMP:")) {
                const tempAmbiante = parseFloat(payload.split(":")[1]);

                if (!isNaN(tempAmbiante)) {
                    // ÉTAPE 1 : Stockage dans InfluxDB (Docker)
                    await saveSensorData('dht11_salon', 'temperature', tempAmbiante);

                    // ÉTAPE 2 : Logique AUTO corrigée pour le modèle 'THERMIQUE'
                    try {
                        // 🌟 CORRECTION CRUCIALE : Le discriminatorKey est 'typeAppareil' et la valeur est 'THERMIQUE'
                        const climatiseur = await Appareil.findOne({ typeAppareil: 'THERMIQUE' });

                        if (climatiseur && climatiseur.status === 'ENLIGNE' && climatiseur.mode === 'AUTO') {
                            let nouvelleCible = climatiseur.temperatureCible;

                            if (tempAmbiante > 26.0) {
                                nouvelleCible = 18;
                            } else if (tempAmbiante < 20.0) {
                                nouvelleCible = 28;
                            } else {
                                nouvelleCible = 24;
                            }

                            if (nouvelleCible !== climatiseur.temperatureCible) {
                                climatiseur.temperatureCible = nouvelleCible;
                                await climatiseur.save();
                                console.log(`🔄 [AUTO SUCCESS] MongoDB mis à jour -> Cible : ${nouvelleCible}°C`);

                                // 🌟 SYNC AVEC L'ESP32 : On informe l'ESP32 du changement de cible calculé par le mode AUTO
                                const deviceTopic = `smart/home/appareil/${climatiseur._id}`;
                                const climaPayload = `ON:${climatiseur.mode}:${nouvelleCible}`;
                                publishMessage(deviceTopic, climaPayload);
                            }
                        }
                    } catch (error) {
                        console.error("❌ Erreur lors du calcul du mode AUTO :", error.message);
                    }
                }
            }
        }

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
    });

    mqttClient.on('error', (err) => {
        console.error("❌ Erreur de connexion MQTT :", err.message);
    });
};

const publishMessage = (topic, message) => {
    if (!mqttClient || !mqttClient.connected) {
        console.error("⚠️ Impossible d'envoyer le message : le client MQTT n'est pas connecté.");
        return;
    }
    const payload = typeof message === 'object' ? JSON.stringify(message) : message;
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
            console.error(`❌ Échec de publication sur ${topic}:`, err.message);
        } else {
            console.log(`✉️ 🚀 Message publié sur [${topic}] -> ${payload}`);
        }
    });
};

module.exports = { initializeMqtt, publishMessage };