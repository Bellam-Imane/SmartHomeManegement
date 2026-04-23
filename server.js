const express = require('express');
const cors = require('cors');

// Import de la connexion multi-bases (MongoDB, PostgreSQL, InfluxDB)
const { connectDatabases } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parser JSON body

// --- Routes ---
app.use('/api/auth', authRoutes);

// --- Health check endpoint ---
app.get('/test-health', (req, res) => {
  res.json({
    message: "Services are running!",
    status: "All systems operational"
  });
});

// --- Start server after DB connection ---
connectDatabases()
  .then(() => {
    console.log("🚀 All Databases are ready!");

    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("❌ Full error:", err);
  });