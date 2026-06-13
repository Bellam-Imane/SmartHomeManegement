// -----------------------------------------------------------------------------
// IMPORTATIONS DES MODULES DE BASE
// -----------------------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');

// -----------------------------------------------------------------------------
// CHARGEMENT DES CONFIGURATIONS ET VARIABLES D'ENVIRONNEMENT (MODELS)
// -----------------------------------------------------------------------------
require('./src/models/Maison');
require('./src/models/Appareil'); 
require('./src/models/SystemeGestionEnergetique');
require('./src/models/HistoriqueConsommation');
require('./src/models/Notifications');

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
const automationRoutes = require('./src/routes/automationRoutes');
const historyRoutes = require('./src/routes/historyRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

// -----------------------------------------------------------------------------
// INITIALISATION DE L'APPLICATION EXPRESS ET HTTP SERVER
// -----------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

// -----------------------------------------------------------------------------
// CONFIGURATION DE SOCKET.IO (MOTEUR TEMPS RÉEL)
// -----------------------------------------------------------------------------
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', // Autorise uniquement votre Frontend React
        methods: ['GET', 'POST']
    }
});

// Partage de l'instance Socket.IO dans l'application Express
app.set('io', io);

// -----------------------------------------------------------------------------
// ÉCOUTEUR DE CONNEXIONS SOCKET.IO
// -----------------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log(`🔌 [SOCKET.IO] Client connecté de manière bidirectionnelle : ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`🔌 [SOCKET.IO] Client déconnecté du serveur`);
    });
});

// -----------------------------------------------------------------------------
// MIDDLEWARES GLOBAUX (SÉCURITÉ, PARSING ET LOGGER)
// -----------------------------------------------------------------------------
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`👉 [HTTP REQUEST] ${req.method} ${req.url}`);
    next();
});

// -----------------------------------------------------------------------------
// ENREGISTREMENT DES ROUTES API
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/appareils', appareilRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/users', userRoutes);
app.use('/api', automationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

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
// GESTIONNAIRE GLOBAL DES ERREURS INTERNES
// -----------------------------------------------------------------------------
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

        // Étape B : Lancement effectif de l'écoute du serveur HTTP (Écoute sur 0.0.0.0 pour le Mobile)
        server.listen(port, '0.0.0.0', () => {
            console.log(`✅ Serveur démarré avec succès sur http://192.168.0.107:${port}`);
            console.log(`🚀 Bases de données connectées et prêtes`);

            // Étape C : Démarrage des tâches de fond automatiques (Cron)
            console.log("⏰ Démarrage du Cron Service (Planification)...");
            initializeMonthlyResetCron();

            // Étape D : Lancement du service d'écoute MQTT
            console.log("⚡ Démarrage du service d'écoute MQTT...");
            const ioInstance = app.get('io');
            if (ioInstance) {
                initializeMqtt(ioInstance);
            } else {
                initializeMqtt(io);
            }
        });
    })
    .catch(err => {
        console.error("❌ Échec critique du démarrage du système complet:", err.message);
    });