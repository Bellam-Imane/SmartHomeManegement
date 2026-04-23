const express = require('express');
const cors = require('cors');

// Importation de la fonction de connexion multi-bases (MongoDB, Postgres, InfluxDB)
const { connectDatabases } = require('./src/config/db'); 

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors()); // Autoriser les requêtes cross-origin
app.use(express.json()); // Parser le corps des requêtes en format JSON

// --- Point de terminaison (Endpoint) pour vérifier l'état du serveur ---
app.get('/test-health', async (req, res) => {
  res.json({
    message: "Services are running!",
    status: "All systems operational"
  });
});

// --- Initialisation du serveur après réussite de la connexion aux bases de données ---
// Cette approche garantit que l'application ne démarre pas si une base est hors ligne
connectDatabases().then(() => {
    console.log("🚀 All Databases are ready!");
    
    // Démarrage de l'écoute sur le port spécifié
    app.listen(port, () => {
        console.log(`✅ Server running on http://localhost:${port}`);
    });
}).catch(err => {
    // Gestion des erreurs fatales lors du démarrage
    console.error("❌ Failed to start server due to DB connection issues", err);
});