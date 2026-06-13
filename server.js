require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 🌟 PRE-LOADING CRITIQUE : Charger tous les modèles Mongoose en premier pour éviter le bug "Schema hasn't been registered"
require('./src/models/Appareil');
require('./src/models/Piece');
require('./src/models/Maison');

// Import de la connexion multi-bases (MongoDB, PostgreSQL, InfluxDB)
const { connectDatabases } = require('./src/config/db');
const initializePostgres = require('./src/models/initPostgres');

// Importation du service de messagerie IoT
const { initializeMqtt } = require('./src/config/mqttService');

// Importation des routes de l'application
const authRoutes = require('./src/routes/authRoutes');
const pieceRoutes = require('./src/routes/pieceRoutes'); 
const appareilRoutes = require('./src/routes/appareilRoutes');
const securityRoutes = require('./src/routes/securityRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---

app.use(cors({ origin: '*' })); 
app.use(express.json()); // Parser JSON body pour récupérer les req.body

// Middleware pour voir passer toutes les requêtes dans la console (pratique pour le debug)
app.use((req, res, next) => {
    console.log("👉 REQUEST:", req.method, req.url);
    next();
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/pieces', pieceRoutes); 
app.use('/api/appareils', appareilRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/users', userRoutes);

// --- Health check endpoint ---
app.get('/test-health', (req, res) => {
  res.json({
    message: "Services are running!",
    status: "All systems operational"
  });
});

// Middleware global pour capturer et afficher les erreurs 500 du serveur
app.use((err, req, res, next) => {
  console.error("❌ ERROR STACK:", err.stack);
  res.status(500).json({ message: "Erreur interne du serveur", error: err.message });
});

// --- Start server after DB connection ---
connectDatabases().then(async () => {
    
    // Activation et vérification des tables PostgreSQL
    try {
        await initializePostgres();
    } catch (err) {
        console.error("❌ Impossible d'initialiser PostgreSQL:", err.message);
    }

    // Lancement de l'écoute du serveur sur le port défini
    
    app.listen(port, '0.0.0.0', () => {
        console.log(`✅ Server running on http://192.168.0.107:${port}`);
        console.log(`🚀 All Databases are ready and tables are checked!`);
        
        console.log("⚡ Démarrage du service MQTT...");
        initializeMqtt();
    });
}).catch(err => {
    console.error("❌ Failed to start the system:", err.message);
});