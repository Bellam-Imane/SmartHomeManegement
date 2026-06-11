const { Point } = require('@influxdata/influxdb-client');
// ── Importation de l'objet global db au lieu de writeApi directement ──
const dbConfig = require('../config/db'); 

/**
 * 📊 SERVICE INFLUXDB - ENREGISTREMENT DES DONNÉES DES CAPTEURS
 */
const saveSensorData = async (sensorName, type, value) => {
    try {
        // Récupération dynamique de la clé writeApi depuis le module db
        const currentWriteApi = dbConfig.writeApi;

        // =========================================================================
        // ⚠️ VÉRIFICATION DE LA CONFIGURATION D'INFLUXDB
        // =========================================================================
        if (!currentWriteApi) {
            console.warn("⚠️ InfluxDB non configuré ou non initialisé, donnée environnementale ignorée.");
            return;
        }

        if (typeof value !== 'number' || isNaN(value)) {
            console.warn(`⚠️ Valeur invalide pour le capteur [${sensorName}] : ${value}`);
            return;
        }

        const point = new Point('environment')
            .tag('sensor_name', sensorName)
            .tag('type', type)
            .floatField('value', value)
            .timestamp(new Date());

        // Écriture forcée et immédiate avec flush pour éviter le lag du buffer
        currentWriteApi.writePoint(point);
        await currentWriteApi.flush(); 

        console.log(`📊 InfluxDB [SENSOR] ${sensorName} | ${type} = ${value}`);

    } catch (error) {
        console.error("❌ Erreur de persistance InfluxDB (Sensor) :", error.message);
    }
};

/**
 * ⚡ SERVICE INFLUXDB - ENREGISTREMENT DE LA CONSOMMATION ÉNERGÉTIQUE
 */
const saveDeviceConsumption = async (deviceId, deviceType, watts) => {
    try {
        // Récupération dynamique de la clé writeApi depuis le module db
        const currentWriteApi = dbConfig.writeApi;

        // =========================================================================
        // ⚠️ VÉRIFICATION DE LA CONFIGURATION D'INFLUXDB
        // =========================================================================
        if (!currentWriteApi) {
            console.warn("⚠️ InfluxDB non configuré ou non initialisé, donnée de consommation ignorée.");
            return;
        }

        if (typeof watts !== 'number' || isNaN(watts)) {
            console.warn(`⚠️ Puissance Watts invalide pour l'appareil [${deviceId}] : ${watts}`);
            return;
        }

        const point = new Point('energy_consumption')
            .tag('device_id', deviceId)
            .tag('device_type', deviceType)
            .floatField('power', watts)
            .timestamp(new Date());

        // Écriture forcée et immédiate avec flush
        currentWriteApi.writePoint(point);
        await currentWriteApi.flush(); 

        console.log(`⚡ InfluxDB [ENERGY] ${deviceType} (${deviceId}) = ${watts}W`);

    } catch (error) {
        console.error("❌ Erreur de persistance InfluxDB (Energy) :", error.message);
    }
};

module.exports = {
    saveSensorData,
    saveDeviceConsumption
};