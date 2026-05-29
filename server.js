// -----------------------------------------------------------------------------
// CHARGEMENT DES CONFIGURATIONS ET VARIABLES D'ENVIRONNEMENT
// -----------------------------------------------------------------------------
// Permet de lire le fichier .env et de charger les variables (ex: PORT, MONGO_URI)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');

// -----------------------------------------------------------------------------
// PRÉ-CHARGEMENT DES MODÈLES MONGOOSE
// -----------------------------------------------------------------------------
// Obligatoire pour enregistrer les Schémas dans Mongoose avant leur utilisation 
// dans d'autres services (comme le service MQTT)
require('./src/models/Appareil');
require('./src/models/Piece');
require('./src/models/Maison');
require('./src/models/SystemeGestionEnergetique');
require('./src/models/HistoriqueConsommation');

// -----------------------------------------------------------------------------
// CONNEXIONS AUX BASES DE DONNÉES (MONGOOSE + POSTGRESQL)
// -----------------------------------------------------------------------------
const { connectDatabases } = require('./src/config/db');
const initializePostgres = require('./src/models/initPostgres');

// -----------------------------------------------------------------------------
// SERVICES EXTERNES (MQTT & CRON DE PLANIFICATION)
// -----------------------------------------------------------------------------
const { initializeMqtt } = require('./src/config/mqttService');
const { initializeMonthlyResetCron } = require('./src/services/cronService');

// -----------------------------------------------------------------------------
// IMPORTATION DES ROUTES DE L'API
// -----------------------------------------------------------------------------
const authRoutes = require('./src/routes/authRoutes');
const pieceRoutes = require('./src/routes/pieceRoutes');
const appareilRoutes = require('./src/routes/appareilRoutes');
const securityRoutes = require('./src/routes/securityRoutes');
const userRoutes = require('./src/routes/userRoutes');

// -----------------------------------------------------------------------------
// INITIALISATION DE L'APPLICATION EXPRESS
// -----------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;

// -----------------------------------------------------------------------------
// CONFIGURATION DE SOCKET.IO (MOTEUR TEMPS RÉEL)
// -----------------------------------------------------------------------------
// Express a besoin d'un serveur HTTP natif pour faire fonctionner Socket.IO
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', // Autorise uniquement votre Frontend React
        methods: ['GET', 'POST']
    }
});

// Partage de l'instance Socket.IO dans l'application Express pour y accéder ailleurs
app.set('io', io);

// -----------------------------------------------------------------------------
// ÉCOUTEUR DE CONNEXIONS SOCKET.IO (CLIENTS REACTIONNEL)
// -----------------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log(`🔌 [SOCKET.IO] Client connecté de manière bidirectionnelle : ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`🔌 [SOCKET.IO] Client déconnecté du serveur`);
    });
});

// -----------------------------------------------------------------------------
// MIDDLEWARES DE SÉCURITÉ ET DE PARSING
// -----------------------------------------------------------------------------
// Protection CORS pour autoriser les requêtes HTTP depuis le Frontend React
app.use(cors({ origin: 'http://localhost:3000' }));

// Permet à Express de lire et parser le format JSON reçu dans req.body
app.use(express.json());

// Logger global : Affiche toutes les requêtes HTTP reçues dans le terminal
app.use((req, res, next) => {
    console.log(`👉 [HTTP REQUEST] ${req.method} ${req.url}`);
    next();
});

// -----------------------------------------------------------------------------
// ENREGISTREMENT DES ROUTES API MIDDLEWARES
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/appareils', appareilRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/users', userRoutes);

// -----------------------------------------------------------------------------
// ROUTE DE VÉRIFICATION DE SANTÉ (HEALTH CHECK)
// -----------------------------------------------------------------------------
app.get('/test-health', (req, res) => {
    res.json({
        message: "Services are running!",
        status: "All systems operational"
    });
});

// -----------------------------------------------------------------------------
// GESTIONNAIRE GLOBAL DES ERREURS INTERNES (CATCH-ALL)
// -----------------------------------------------------------------------------
// Sécurité : Évite le crash du serveur si une route lève une exception non gérée
app.use((err, req, res, next) => {
    console.error("❌ [ERREUR SERVEUR]:", err.stack);

    res.status(500).json({
        message: "Erreur interne du serveur",
        error: err.message
    });
});

// -----------------------------------------------------------------------------
// DÉMARRAGE DU SYSTÈME APRÈS VÉRIFICATION DES BASES DE DONNÉES
// -----------------------------------------------------------------------------
connectDatabases()
    .then(async () => {
        // Étape A : Initialisation de la base SQL (PostgreSQL) si nécessaire
        try {
            await initializePostgres();
        } catch (err) {
            console.error("❌ Erreur lors de l'initialisation PostgreSQL:", err.message);
        }

        // Étape B : Lancement effectif de l'écoute du serveur HTTP
        server.listen(port, () => {
            console.log(`✅ Serveur démarré avec succès sur http://localhost:${port}`);
            console.log(`🚀 Bases de données connectées et prêtes`);

            // Étape C : Démarrage des tâches de fond automatiques (Cron)
            console.log("⏰ Démarrage du Cron Service (Planification)...");
            initializeMonthlyResetCron();

            // Étape D : Lancement du service d'écoute MQTT (Fake ESP32)
            console.log("⚡ Démarrage du service d'écoute MQTT...");
            const ioInstance = app.get('io');

            if (ioInstance) {
                initializeMqtt(ioInstance);
            } else {
                console.warn("⚠️ Socket.IO pas encore totalement disponible lors de l'initialisation MQTT");
                initializeMqtt(io);
            }
        });
    })
    .catch(err => {
        console.error("❌ Échec critique du démarrage du système complet:", err.message);
    });