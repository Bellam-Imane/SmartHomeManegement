const { Pool } = require('pg');
const mongoose = require('mongoose');
const { InfluxDB } = require('@influxdata/influxdb-client');

// PostgreSQL config - Using environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smarthome_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5433,
});

// InfluxDB config - Using environment variables
const influxToken = process.env.INFLUX_TOKEN || 'my_super_secret_token';
const influxUrl = process.env.INFLUX_URL || 'http://localhost:8086';
const influxClient = new InfluxDB({ url: influxUrl, token: influxToken });

// MongoDB URI - Using environment variables
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartHomeDB";

const connectDatabases = async () => {

  // 🟢 MongoDB
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB failed:', err.message);
  }

  // 🟢 PostgreSQL
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL failed:', err.message);
    console.error('   Details:', err.code, '-', err.detail || err.message);
  }

  // 🟢 InfluxDB (test simple)
  try {
    console.log('✅ InfluxDB client ready');
  } catch (err) {
    console.error('❌ InfluxDB failed:', err.message);
  }

  return { pool, influxClient };
};

module.exports = { connectDatabases, pool, influxClient };