const { Point } = require('@influxdata/influxdb-client');
const { writeApi } = require('../config/db'); 

/**
 * 📊 SERVICE INFLUXDB - ENREGISTREMENT CAPTEURS
 * Stocke les données environnementales dans InfluxDB
 */
const saveSensorData = async (sensorName, type, value) => {
    try {

        // ======================================================
        // ⚠️ Vérification configuration InfluxDB
        // ======================================================
        if (!writeApi) {
            console.warn("⚠️ InfluxDB non configuré, donnée ignorée.");
            return;
        }

        // ======================================================
        // 🔍 Validation des données
        // ======================================================
        if (typeof value !== 'number' || isNaN(value)) {
            console.warn(`⚠️ Valeur invalide capteur: ${value}`);
            return;
        }

        // ======================================================
        // 📌 Création du point InfluxDB
        // ======================================================
        const point = new Point('environment')
            .tag('sensor_name', sensorName)
            .tag('type', type)
            .floatField('value', value)
            .timestamp(new Date());

        // 💾 Écriture (buffered, pas immédiat flush)
        writeApi.writePoint(point);

        console.log(`📊 InfluxDB [SENSOR] ${sensorName} | ${type} = ${value}`);

    } catch (error) {
        console.error("❌ InfluxDB sensor error :", error.message);
    }
};

/**
 * ⚡ SERVICE INFLUXDB - CONSOMMATION ÉNERGÉTIQUE
 * Stocke la consommation électrique des appareils
 */
const saveDeviceConsumption = async (deviceId, deviceType, watts) => {
    try {

        // ======================================================
        // ⚠️ Vérification InfluxDB
        // ======================================================
        if (!writeApi) {
            console.warn("⚠️ InfluxDB non configuré, consommation ignorée.");
            return;
        }

        // ======================================================
        // 🔍 Validation
        // ======================================================
        if (typeof watts !== 'number' || isNaN(watts)) {
            console.warn(`⚠️ Watts invalide: ${watts}`);
            return;
        }

        // ======================================================
        // 📌 Point énergie
        // ======================================================
        const point = new Point('energy_consumption')
            .tag('device_id', deviceId)
            .tag('device_type', deviceType)
            .floatField('power', watts)
            .timestamp(new Date());

        writeApi.writePoint(point);

        console.log(`⚡ InfluxDB [ENERGY] ${deviceType} (${deviceId}) = ${watts}W`);

    } catch (error) {
        console.error("❌ InfluxDB energy error :", error.message);
    }
};

module.exports = {
    saveSensorData,
    saveDeviceConsumption
};