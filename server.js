const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./src/config/db');
const { createUserTable } = require('./src/models/User'); 
const port = process.env.PORT || 5000; 
app.use(cors());
app.use(express.json());


app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Database connected successfully!", time: result.rows[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


createUserTable().then(() => {
    console.log("✅ Database is ready to use!");
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});