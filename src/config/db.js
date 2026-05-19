const mongoose = require('mongoose');
const { InfluxDB } = require('@influxdata/influxdb-client');
const { Pool } = require('pg');

const mongoURI = process.env.MONGO_URI;
const influxUrl = process.env.INFLUX_URL || 'http://localhost:8086';
const influxToken = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG || 'myhome';
const bucket = process.env.INFLUX_BUCKET || 'sensors_data';

let influxClient = null;
let writeApi = null;

// Pool PostgreSQL exporté directement pour être utilisé dans initPostgres et ailleurs
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5433,
});

const connectDatabases = async () => {
  try {
    // Connexion MongoDB
    await mongoose.connect(mongoURI);
    console.log("🎲 ✅ MongoDB connecté avec succès !");

    // Vérification connexion PostgreSQL
    try {
      const client = await pgPool.connect();
      client.release();
      console.log("🐘 ✅ PostgreSQL connecté avec succès !");
    } catch (pgError) {
      console.error("❌ PostgreSQL: Échec de connexion :", pgError.message);
    }

    // Initialisation InfluxDB
    try {
      if (influxToken) {
        influxClient = new InfluxDB({ url: influxUrl, token: influxToken });
        writeApi = influxClient.getWriteApi(org, bucket, 'ms');
        console.log("📊 ✅ InfluxDB Client & Write API initialisés !");
      } else {
        console.warn("⚠️ [InfluxDB WARNING] INFLUX_TOKEN introuvable dans le fichier .env !");
      }
    } catch (influxError) {
      console.error("⚠️ [InfluxDB ERROR] Échec d'initialisation :", influxError.message);
    }

    return true;
  } catch (error) {
    console.error("❌ Échec de connexion à MongoDB :", error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDatabases,
  pgPool,
  get influxClient() { return influxClient; },
  get writeApi() { return writeApi; }
};