const { Pool } = require('pg'); // Pour PostgreSQL
const mongoose = require('mongoose'); // Pour MongoDB
const { InfluxDB } = require('@influxdata/influxdb-client'); // Pour InfluxDB

// 1. Configuration PostgreSQL
const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',
  database: 'smarthome_db',  
  password: 'Riham1234',      
  port: 5433,                 
});

// 2. Configuration InfluxDB 
const influxToken = 'my_super_secret_token';
const influxUrl = 'http://localhost:8086';
const influxClient = new InfluxDB({ url: influxUrl, token: influxToken });


// 3. Fonction de connexion globale
const connectDatabases = async () => {
  try {
    // --- Connexion MongoDB ---
    await mongoose.connect('mongodb://localhost:27017/smarthome_mongo');
    console.log('✅ Connected to MongoDB successfully!');

    // --- Test Connexion PostgreSQL ---
    const pgClient = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    pgClient.release();

    // --- Initialisation InfluxDB ---
    console.log('✅ InfluxDB Client initialized (Bucket: sensors_data)');

    return { pool, influxClient };
  } catch (err) {
    console.error('❌ Error connecting to databases:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDatabases, pool, influxClient };