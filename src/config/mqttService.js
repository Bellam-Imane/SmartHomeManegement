const mqtt = require('mqtt');

// Configuration du Broker public gratuit HiveMQ
// Nous utilisons le protocole WebSocket (ws) sur le port 8000 car il est très stable
const MQTT_BROKER = 'ws://broker.hivemq.com:8000/mqtt';

let mqttClient = null;

/**
 * Initialise la connexion avec le Broker MQTT
 * Cette fonction est appelée au démarrage du serveur Node.js
 */
const initializeMqtt = () => {
    console.log("⏳ Connexion au Broker MQTT HiveMQ en cours...");
    
    mqttClient = mqtt.connect(MQTT_BROKER);

    // Événement déclenché lorsque la connexion est établie avec succès
    mqttClient.on('connect', () => {
        console.log("📡 ✅ Connecté avec succès au Broker MQTT (HiveMQ) !");
    });

    // Événement déclenché en cas d'erreur de connexion
    mqttClient.on('error', (err) => {
        console.error("❌ Erreur de connexion MQTT :", err.message);
    });
};

/**
 * Fonction globale pour publier un message sur un Topic spécifique
 * @param {string} topic - Le canal cible (ex: 'smart/home/appareil/ID')
 * @param {string|object} message - Le contenu textuel ou objet à envoyer (ex: 'ON:REC')
 */
const publishMessage = (topic, message) => {
    // Vérification de l'état de la connexion avant l'envoi
    if (!mqttClient || !mqttClient.connected) {
        console.error("⚠️ Impossible d'envoyer le message : le client MQTT n'est pas connecté.");
        return;
    }

    // Sérialisation automatique si le message reçu est un objet JSON
    const payload = typeof message === 'object' ? JSON.stringify(message) : message;
    
    // Publication du message avec une qualité de service QoS de 1 (Garantit la livraison)
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
            console.error(`❌ Échec de publication sur ${topic}:`, err.message);
        } else {
            console.log(`✉️ 🚀 Message publié sur [${topic}] -> ${payload}`);
        }
    });
};

// Exportation des fonctions pour les utiliser dans les contrôleurs (ex: appareilController.js)
module.exports = {
    initializeMqtt,
    publishMessage
};