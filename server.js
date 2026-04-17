const express = require('express');
const app = express();
const pool = require('./src/config/db');
const port = process.env.PORT || 3000;

app.use(express.json());

// تجربة الربط
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Database connected successfully!", time: result.rows[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});