/**
 * influxService.js
 * Service pour gérer l'écriture des données capteurs dans InfluxDB.
 */
const { Point } = require('@influxdata/influxdb-client');

/**
 * Enregistre une mesure de capteur dans InfluxDB.
 * @param {string} sensorName - Nom du capteur (ex: 'dht11_salon')
 * @param {string} type - Type de mesure (ex: 'temperature')
 * @param {number} value - La valeur mesurée (ex: 24.5)
 */
const saveSensorData = async (sensorName, type, value) => {
    try {
        const { writeApi } = require('../config/db');

        if (!writeApi) {
            console.warn("⚠️ InfluxDB non configuré, donnée ignorée.");
            return;
        }

        const point = new Point('environment')
            .tag('sensor_name', sensorName)
            .tag('type', type)
            .floatField('value', value)
            .timestamp(new Date());

        writeApi.writePoint(point);
        await writeApi.flush(); // ✅ Envoie immédiatement les données vers InfluxDB
        console.log(`📊 InfluxDB: Donnée enregistrée [${type}] : ${value}`);
    } catch (error) {
        console.error("❌ InfluxDB: Erreur d'écriture :", error.message);
    }
};

module.exports = { saveSensorData };