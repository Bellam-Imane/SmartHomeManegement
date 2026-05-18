const mqtt = require('mqtt');

// Configuration du Broker public gratuit HiveMQ
// Nous utilisons le protocole WebSocket (ws) sur le port 8000 car il est très stable
const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';

let mqttClient = null;

/**
 * Initialise la connexion avec le Broker MQTT
 */
const initializeMqtt = () => {
    console.log("⏳ Connexion au Broker MQTT HiveMQ en cours...");
    
    mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
        console.log("📡 ✅ Connecté avec succès au Broker MQTT (HiveMQ) !");
    });

    mqttClient.on('error', (err) => {
        console.error("❌ Erreur de connexion MQTT :", err.message);
    });
};

/**
 * Fonction globale pour publier un message sur un Topic spécifique
 * @param {string} topic - Le canal (ex: 'home/salon/eclairage')
 * @param {string|object} message - Le contenu à envoyer (ex: 'ON' ou 'OFF')
 */
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

module.exports = {
    initializeMqtt,
    publishMessage
};