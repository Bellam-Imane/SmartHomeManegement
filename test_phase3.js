/**
 * test_phase3.js
 * Script de validation Phase 3 :
 * 1. Publie 3 messages MQTT (température, humidité, qualité de l'air)
 * 2. Attend 3 secondes, puis lit la dernière valeur de chaque type depuis InfluxDB
 * Utilisez : node test_phase3.js
 */
require('dotenv').config();
const mqtt = require('mqtt');

const BROKER = 'ws://broker.hivemq.com:8000/mqtt';
const messages = [
    { topic: 'smart/home/climatiseur/mesures', payload: 'TEMP:27.5',  label: 'Température' },
    { topic: 'smart/home/capteurs/humidite',   payload: 'HUMI:65.3',  label: 'Humidité'    },
    { topic: 'smart/home/capteurs/air',        payload: 'AIR:420',    label: 'Qualité Air' },
];

console.log('🚀 Test Phase 3 — Publication des 3 types de capteurs\n');
console.log('📡 Connexion au broker MQTT HiveMQ...');

const client = mqtt.connect(BROKER, { clientId: 'smarthome_phase3_' + Date.now() });

client.on('connect', () => {
    console.log('✅ Connecté.\n');

    let published = 0;
    messages.forEach(({ topic, payload, label }) => {
        client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error(`❌ [${label}] Échec : ${err.message}`);
            } else {
                console.log(`📤 [${label}] Publié → Topic: ${topic}  |  Payload: "${payload}"`);
            }
            published++;
            if (published === messages.length) {
                console.log('\n✅ Les 3 messages sont publiés.');
                console.log('👀 Vérifie ton terminal serveur — tu dois voir 3 lignes "📊 InfluxDB: Donnée enregistrée"');
                console.log('\n⏳ Attente 3s avant lecture depuis InfluxDB...\n');
                setTimeout(testRead, 3000);
            }
        });
    });
});

const testRead = async () => {
    console.log('📖 Test lecture InfluxDB (getLatestSensorData)...\n');
    const { getLatestSensorData } = require('./src/services/influxService');

    const types = ['temperature', 'humidite', 'qualite_air'];
    for (const type of types) {
        const val = await getLatestSensorData(type, '-5m');
        if (val !== null) {
            console.log(`✅ [${type}] Dernière valeur lue depuis InfluxDB : ${val}`);
        } else {
            console.log(`⚠️  [${type}] Aucune donnée trouvée dans la fenêtre -5min (normal si le serveur n'a pas encore traité le message)`);
        }
    }

    console.log('\n🏁 Test Phase 3 terminé. Fermeture.');
    client.end();
    process.exit(0);
};

client.on('error', (err) => {
    console.error('❌ Erreur MQTT :', err.message);
    process.exit(1);
});
