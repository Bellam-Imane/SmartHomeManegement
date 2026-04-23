const { Pool } = require('pg');
const mongoose = require('mongoose');
const { InfluxDB } = require('@influxdata/influxdb-client');

// PostgreSQL config
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smarthome_db',
  password: 'Riham1234',
  port: 5433,
});

// InfluxDB config
const influxToken = 'my_super_secret_token';
const influxUrl = 'http://localhost:8086';
const influxClient = new InfluxDB({ url: influxUrl, token: influxToken });

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/smarthome_mongo';

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