const pool = require('../config/db');

/**
 * وظيفة لإنشاء جدول المستخدمين إذا لم يكن موجوداً
 */
const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    const res = await pool.query(queryText);
    console.log("✅ User table is ready (Created or already exists).");
  } catch (err) {
    console.error("❌ Error while creating User table:", err.message);
  }
};

module.exports = { createUserTable };