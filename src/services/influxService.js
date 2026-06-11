/**
 * influxService.js
 * Service pour gérer l'écriture et la lecture des données capteurs dans InfluxDB.
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

/**
 * Récupère la dernière valeur enregistrée pour un type de capteur donné.
 * @param {string} type - Type de mesure (ex: 'temperature', 'humidite', 'qualite_air')
 * @param {string} range - Fenêtre de temps Flux (ex: '-1h', '-24h'). Défaut: '-1h'
 * @returns {Promise<number|null>} La dernière valeur, ou null si aucune donnée.
 */
const getLatestSensorData = (type, range = '-1h') => {
    return new Promise((resolve) => {
        try {
            const { queryApi } = require('../config/db');
            const bucket = process.env.INFLUX_BUCKET || 'sensors_data';

            if (!queryApi) {
                console.warn("⚠️ InfluxDB queryApi non configuré.");
                return resolve(null);
            }

            // Requête Flux : dernière valeur du type demandé dans la fenêtre de temps
            const fluxQuery = `
                from(bucket: "${bucket}")
                  |> range(start: ${range})
                  |> filter(fn: (r) => r._measurement == "environment")
                  |> filter(fn: (r) => r.type == "${type}")
                  |> filter(fn: (r) => r._field == "value")
                  |> last()
            `;

            let lastValue = null;

            queryApi.queryRows(fluxQuery, {
                next(row, tableMeta) {
                    const obj = tableMeta.toObject(row);
                    lastValue = obj._value;
                },
                error(err) {
                    console.error(`❌ InfluxDB: Erreur de lecture [${type}] :`, err.message);
                    resolve(null);
                },
                complete() {
                    resolve(lastValue);
                },
            });
        } catch (error) {
            console.error("❌ InfluxDB: Exception getLatestSensorData :", error.message);
            resolve(null);
        }
    });
};

/**
 * Fetches aggregated time-series data from InfluxDB for chart rendering.
 * Uses Flux aggregateWindow to group data by time buckets.
 * @param {string} type - Sensor type (ex: 'temperature')
 * @param {string} range - Time window (ex: '-30d', '-7d', '-24h'). Default: '-7d'
 * @param {string} window - Aggregation window (ex: '1d', '1h', '1mo'). Default: '1d'
 * @returns {Promise<Array<{time: string, value: number}>>}
 */
const getSensorTimeSeries = (type, range = '-7d', window = '1d') => {
    return new Promise((resolve) => {
        try {
            const { queryApi } = require('../config/db');
            const bucket = process.env.INFLUX_BUCKET || 'sensors_data';

            if (!queryApi) {
                console.warn("⚠️ InfluxDB queryApi non configuré.");
                return resolve([]);
            }

            const fluxQuery = `
                from(bucket: "${bucket}")
                  |> range(start: ${range})
                  |> filter(fn: (r) => r._measurement == "environment")
                  |> filter(fn: (r) => r.type == "${type}")
                  |> filter(fn: (r) => r._field == "value")
                  |> aggregateWindow(every: ${window}, fn: mean, createEmpty: false)
                  |> yield(name: "${type}")
            `;

            const rows = [];

            queryApi.queryRows(fluxQuery, {
                next(row, tableMeta) {
                    const obj = tableMeta.toObject(row);
                    rows.push({
                        time: obj._time,
                        value: Math.round((obj._value + Number.EPSILON) * 100) / 100
                    });
                },
                error(err) {
                    console.error(`❌ InfluxDB: Erreur getSensorTimeSeries [${type}] :`, err.message);
                    resolve([]);
                },
                complete() {
                    resolve(rows);
                },
            });
        } catch (error) {
            console.error("❌ InfluxDB: Exception getSensorTimeSeries :", error.message);
            resolve([]);
        }
    });
};

/**
 * Fetches aggregated energy data for the dashboard chart.
 * Returns temperature-based data (proxy for energy usage) + simulated consumption.
 * @param {string} range - Time window (ex: '-30d', '-7d'). Default: '-7d'
 * @param {string} window - Aggregation window (ex: '1d', '1h'). Default: '1d'
 * @returns {Promise<Object>} Chart data with labels, temperature, and consumption arrays
 */
const getEnergyAggregated = async (range = '-7d', window = '1d') => {
    try {
        // Fetch temperature time-series from InfluxDB
        const tempData = await getSensorTimeSeries('temperature', range, window);

        // Build chart-friendly format
        const labels = [];
        const temperature = [];
        const consumption = [];

        for (const point of tempData) {
            // Format date label
            const date = new Date(point.time);
            const label = window === '1h'
                ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

            labels.push(label);
            temperature.push(point.value);

            // Simulated energy consumption: baseline 2kWh + proportional to temp delta from 22°C
            // Higher temp = more AC usage = more consumption
            const tempDelta = Math.max(0, point.value - 22);
            const simulatedKwh = Math.round((2.0 + tempDelta * 0.8) * 100) / 100;
            consumption.push(simulatedKwh);
        }

        return {
            range,
            window,
            count: labels.length,
            labels,
            temperature,
            consumption
        };
    } catch (error) {
        console.error("❌ InfluxDB: getEnergyAggregated error:", error.message);
        return { range, window, count: 0, labels: [], temperature: [], consumption: [] };
    }
};

module.exports = { saveSensorData, getLatestSensorData, getSensorTimeSeries, getEnergyAggregated };
