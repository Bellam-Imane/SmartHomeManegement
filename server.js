require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import de la connexion multi-bases (MongoDB, PostgreSQL, InfluxDB)
const { connectDatabases } = require('./src/config/db');
const initializePostgres = require('./src/models/initPostgres');

// Importation des routes de l'application
const authRoutes = require('./src/routes/authRoutes');
const pieceRoutes = require('./src/routes/pieceRoutes'); // ✅ Ajout de la route des pièces pour corriger l'erreur 404

const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---
app.use(cors({ origin: 'http://localhost:3000' })); // Autoriser les requêtes cross-origin (React sur port 3000)
app.use(express.json()); // Parser JSON body pour récupérer les req.body

// Middleware pour voir passer toutes les requêtes dans la console (pratique pour le debug)
app.use((req, res, next) => {
    console.log("👉 REQUEST:", req.method, req.url);
    next();
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/pieces', pieceRoutes); // ✅ Activation officielle du préfixe /api/pieces pour le backend

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
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`🚀 All Databases are ready and tables are checked!`);
    });
}).catch(err => {
    console.error("❌ Failed to start the system:", err.message);
});