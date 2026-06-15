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

        // 1. Création d'une pièce de test (Grand Salon)
        const salon = new Piece({
            nomPiece: "Grand Salon",
            type: "Salon",
            superficie: "35m2",
            maison: new mongoose.Types.ObjectId(), // ID fictif
            etage: 0
        });
        await salon.save();

        // 2. Liste des appareils à insérer avec les IDs MQTT correspondants
        const initialDevices = [
            {
                _id: new mongoose.Types.ObjectId("6a0cf42e7264a021407dae9d"),
                nomAppareil: "Lumière Principale",
                typeAppareil: "ECLAIRAGE",
                piece: salon._id,
                status: "ENLIGNE",
                intensite: 100,
                couleur: "#FFFFFF"
            },
            {
                _id: new mongoose.Types.ObjectId("6a0cf43a7264a021407dae9e"),
                nomAppareil: "Caméra Entrée",
                typeAppareil: "CAMERA",
                piece: salon._id,
                status: "ENLIGNE",
                resolution: "1080p",
                estEnregistrement: true
            },
            {
                _id: new mongoose.Types.ObjectId("6a0cf4487264a021407dae9f"),
                nomAppareil: "Climatiseur Samsung",
                typeAppareil: "THERMIQUE",
                piece: salon._id,
                status: "ENLIGNE",
                temperatureActuelle: 24,
                temperatureCible: 21,
                mode: "FROID"
            },
            {
                _id: new mongoose.Types.ObjectId("6a0e0999a05e12a54e87872b"),
                nomAppareil: "Télévision Salon",
                typeAppareil: "MULTIMEDIA",
                piece: salon._id,
                status: "ENLIGNE",
                volume: 20,
                source: "HDMI",
                application: "NONE",
                lectureActive: true
            },
            {
                _id: new mongoose.Types.ObjectId("6a10d976513a833a7ea56ecf"),
                nomAppareil: "Rideau Salon 1",
                typeAppareil: "MOTORISE",
                piece: salon._id,
                status: "ENLIGNE",
                pourcentageOuverture: 40,
                estVerrouille: false
            },
            {
                _id: new mongoose.Types.ObjectId("6a10d99c513a833a7ea56ed0"),
                nomAppareil: "Rideau Salon 2",
                typeAppareil: "MOTORISE",
                piece: salon._id,
                status: "ENLIGNE",
                pourcentageOuverture: 60,
                estVerrouille: false
            },
            {
                _id: new mongoose.Types.ObjectId("6a10dc92513a833a7ea56ed1"),
                nomAppareil: "Aspirateur Robot",
                typeAppareil: "ASPIRATEUR",
                piece: salon._id,
                status: "HORSLIGNE",
                chargeBatterie: 100,
                modeNettoyage: "STANDARD"
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