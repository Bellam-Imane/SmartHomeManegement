/**
 * test_mqtt_influx.js
 * Script de test Phase 2 : publie un message MQTT simulant le capteur DHT11.
 * Le serveur SmartHome doit être en cours d'exécution (npm start).
 * Utilisez : node test_mqtt_influx.js
 */
const mqtt = require('mqtt');

const BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const TOPIC  = 'smart/home/climatiseur/mesures';
const VALUE  = 'TEMP:27.5';

console.log('🔌 Connexion au broker MQTT HiveMQ...');
const client = mqtt.connect(BROKER, { clientId: 'smarthome_test_' + Date.now() });

client.on('connect', () => {
    console.log('✅ Connecté au broker.');
    console.log(`📤 Publication sur [${TOPIC}] → "${VALUE}"`);

    client.publish(TOPIC, VALUE, { qos: 1 }, (err) => {
        if (err) {
            console.error('❌ Échec de publication :', err.message);
        } else {
            console.log('✅ Message publié avec succès !');
            console.log('👀 Vérifie maintenant la console du serveur (npm start)...');
        }
        // Attendre 2s pour laisser le serveur répondre, puis fermer
        setTimeout(() => { client.end(); process.exit(0); }, 2000);
    });
});

client.on('error', (err) => {
    console.error('❌ Erreur de connexion MQTT :', err.message);
    process.exit(1);
});
