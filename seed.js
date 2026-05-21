const mongoose = require('mongoose');
const { Appareil } = require('./src/models/Appareil'); // Vérifie bien le chemin
const Piece = require('./src/models/Piece');
require('dotenv').config();

const seedDB = async () => {
    try {
        // Connexion à MongoDB via l'URL du fichier .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connexion réussie à MongoDB pour l'initialisation...");

        // Nettoyage des anciennes données pour éviter les doublons
        await Appareil.deleteMany({});
        await Piece.deleteMany({});

        // 1. Création d'une maison/pièce de test
        const salon = new Piece({
            nomPiece: "Grand Salon",
            type: "Salon",
            superficie: "35m2",
            maison: new mongoose.Types.ObjectId(), // ID fictif
            etage: 0
        });
        await salon.save();

        // 2. Liste des appareils à insérer
        const initialDevices = [
            {
                nomAppareil: "Lumière Principale",
                typeAppareil: "ECLAIRAGE",
                piece: salon._id,
                status: "ENLIGNE",
                intensite: 100,
                couleur: "#FFFFFF"
            },
            {
                nomAppareil: "Climatiseur Samsung",
                typeAppareil: "THERMIQUE",
                piece: salon._id,
                status: "ENLIGNE",
                temperatureActuelle: 24,
                temperatureCible: 21,
                mode: "FROID"
            },
            {
                nomAppareil: "Caméra Entrée",
                typeAppareil: "CAMERA",
                piece: salon._id,
                status: "ENLIGNE",
                resolution: "1080p",
                estEnregistrement: true
            }
        ];

        // Insertion massive
        const createdDevices = await Appareil.insertMany(initialDevices);
        
        // Mise à jour de la pièce avec les IDs des appareils créés
        salon.appareils = createdDevices.map(d => d._id);
        await salon.save();

        console.log("🚀 Base de données initialisée avec " + createdDevices.length + " appareils !");
        process.exit();
    } catch (err) {
        console.error("❌ Erreur de Seeding:", err);
        process.exit(1);
    }
};

seedDB();