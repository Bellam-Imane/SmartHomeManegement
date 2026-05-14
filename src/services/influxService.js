/**
 * influxService.js
 * Service pour gérer l'écriture des données capteurs dans InfluxDB
 */
const { Point } = require('@influxdata/influxdb-client');
const { influxClient } = require('../config/db'); // تأكدي من المسار ديال ملف db.js

// Configuration récupérée depuis ton docker-compose
const org = 'myhome';
const bucket = 'sensors_data';

// Création de l'interface d'écriture
const writeApi = influxClient.getWriteApi(org, bucket);

/**
 * Fonction pour enregistrer une mesure de capteur
 * @param {string} sensorName - Nom du capteur (ex: 'temp_salon')
 * @param {string} type - Type de mesure (ex: 'temperature')
 * @param {number} value - La valeur mesurée (ex: 24.5)
 */
const saveSensorData = (sensorName, type, value) => {
    try {
        // Création d'un nouveau point de donnée
        const point = new Point('environment')
            .tag('sensor_name', sensorName) // Tag pour filtrer rapidement
            .tag('type', type)              // Tag pour le type de mesure
            .floatField('value', value)      // La valeur numérique
            .timestamp(new Date());          // Heure précise

        // Écriture du point
        writeApi.writePoint(point);
        
        // Optionnel: On peut forcer l'envoi immédiat (flush)
        // writeApi.flush();
        
        console.log(`📊 InfluxDB: Donnée enregistrée [${type}] : ${value}`);
    } catch (error) {
        console.error("❌ InfluxDB: Erreur d'écriture", error.message);
    }
};

module.exports = { saveSensorData };