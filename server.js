// -----------------------------------------------------------------------------
// IMPORTATIONS DES MODULES DE BASE (CORRECTIF : AJOUT DES MODULES MANQUANTS)
// -----------------------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');


// -----------------------------------------------------------------------------
// CHARGEMENT DES CONFIGURATIONS ET VARIABLES D'ENVIRONNEMENT
// -----------------------------------------------------------------------------
require('./src/models/Maison');
require('./src/models/Appareil'); // Ajout sécurisé pour les routes de l'API
require('./src/models/SystemeGestionEnergetique');
require('./src/models/HistoriqueConsommation');
require('./src/models/Notifications');

// -----------------------------------------------------------------------------
// CONNEXIONS AUX BASES DE DONNÉES (MONGOOSE + POSTGRESQL)
// -----------------------------------------------------------------------------
const { connectDatabases } = require('./src/config/db');
const initializePostgres = require('./src/models/initPostgres');

// Importation du service de messagerie IoT
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
// INITIALISATION DE L'APPLICATION EXPRESS
// -----------------------------------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;

// --- Middlewares ---

app.use(cors({ origin: '*' })); 
app.use(express.json()); // Parser JSON body pour récupérer les req.body
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
// Authentification JWT + attribution de rooms par utilisateur
// -----------------------------------------------------------------------------
io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token;
    let userId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
            socket.join(`user:${userId}`);
            console.log(`[SOCKET.IO] Client connecté : ${socket.id} -> user:${userId}`);
        } catch (err) {
            console.warn(`[SOCKET.IO] Token invalide pour ${socket.id}: ${err.message}`);
        }
    } else {
        console.log(`[SOCKET.IO] Client connecté (sans token) : ${socket.id}`);
    }

    // Stocker le userId sur le socket pour usage interne
    socket.userId = userId;

    socket.on('disconnect', () => {
        console.log(`[SOCKET.IO] Client déconnecté : ${socket.id}`);
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
