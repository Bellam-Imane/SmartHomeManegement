const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',
  database: 'smarthome_db',  
  password: 'Riham1234',      
  port: 5433,                 
});


pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL successfully!');
  release();
});

module.exports = pool;

