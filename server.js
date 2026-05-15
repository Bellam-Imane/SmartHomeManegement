require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import de la connexion multi-bases (MongoDB, PostgreSQL, InfluxDB)
const { connectDatabases } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({ origin: 'http://localhost:3000' }));// Autoriser les requêtes cross-origin
app.use(express.json()); // Parser JSON body


app.use((req, res, next) => {
    console.log("👉 REQUEST:", req.method, req.url);
    next();
});


// --- Routes ---
app.use('/api/auth', authRoutes);

// --- Health check endpoint ---
app.get('/test-health', (req, res) => {
  res.json({
    message: "Services are running!",
    status: "All systems operational"
  });
});
// Middleware pour capturer les erreurs 500
app.use((err, req, res, next) => {
  console.error("❌ ERROR STACK:", err.stack);
  res.status(500).json({ message: "Erreur interne du serveur", error: err.message });
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