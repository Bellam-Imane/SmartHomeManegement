const mongoose = require('mongoose');

// Options de base pour le mécanisme de discrimination
const baseOptions = {
    discriminatorKey: 'typeAppareil', // La clé qui permet de distinguer le type d'appareil dans MongoDB
    collection: 'appareils',
    timestamps: true,
    strict: false // 🌟 Permet de sauvegarder les champs des sous-modèles lors d'un update via le modèle parent
};

// Schéma parent pour tous les appareils de la maison
const appareilSchema = new mongoose.Schema({
    nomAppareil: {
        type: String,
        required: true,
        trim: true
    },
    marque: {
        type: String
    },
    status: {
        type: String,
        enum: ['ENLIGNE', 'HORSLIGNE'],
        default: 'HORSLIGNE'
    },
    consommationActuelle: {
        type: Number,
        default: 0
    },
    dateAjout: { type: Date, default: Date.now },
    piece: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Piece',
        required: true
    }
}, baseOptions);

const Appareil = mongoose.model('Appareil', appareilSchema);

// ==========================================
// 1. APPAREILS SIMPLES (Discriminateurs directs)
// ==========================================

// Appareil Éclairage
const AppareilEclairage = Appareil.discriminator('ECLAIRAGE', new mongoose.Schema({
    intensite: { type: Number, default: 100 },
    couleur: { type: String, default: '#FFFFFF' }
}));

// Appareil Thermique (Climatiseur)
const AppareilThermique = Appareil.discriminator('THERMIQUE', new mongoose.Schema({
    temperatureActuelle: { type: Number },
    temperatureCible: { type: Number },
    mode: { type: String, enum: ['CHAUD', 'FROID', 'AUTO'] }
}));

// Appareil Multimédia (TV / Streaming)
const AppareilMultimedia = Appareil.discriminator('MULTIMEDIA', new mongoose.Schema({
    volume: { type: Number, min: 0, max: 100 },
    source: { type: String, enum: ['HDMI', 'Bluetooth', 'WIFI'] },
    application: {
        type: String,
        enum: ['TV', 'YOUTUBE', 'NETFLIX', 'SPOTIFY', 'NONE'],
        default: 'NONE'
    },
    chaineActuelle: { type: Number },
    estMuet: { type: Boolean, default: false },
    niveauLuminosite: { type: Number, default: 50 },
    
    // 📺 🌟 AJOUT CRUCIAL : État de lecture pour la synchronisation (PLAY / PAUSE) avec l'ESP32
    lectureActive: { type: Boolean, default: true },
    
    // ⏱️ Champs de suivi pour le calcul du temps d'utilisation global
    dernierAllumage: { type: Date, default: null },
    tempsUtilisationTotal: { type: Number, default: 0 }
}));

// Appareil Motorisé (Rideaux)
const AppareilMotorise = Appareil.discriminator('MOTORISE', new mongoose.Schema({
    pourcentageOuverture: { type: Number, min: 0, max: 100, default: 0 },
    estVerrouille: { type: Boolean, default: true },
    mode: { type: String, default: 'Ombrage automatique' } 
}));

// Appareil Aspirateur Robot
const Aspirateur = Appareil.discriminator('ASPIRATEUR', new mongoose.Schema({
    chargeBatterie: { type: Number, min: 0, max: 100, default: 100 },
    estEnCharge: { type: Boolean, default: false },
    modeNettoyage: { type: String, enum: ['STANDARD', 'SILENCIEUX', 'TURBO'], default: 'STANDARD' }
}));

// ==========================================
// 2. CONFIGURATION DE LA SÉCURITÉ
// ==========================================

// Définition des propriétés communes pour les appareils de sécurité
const proprietesSecuriteBase = {
    niveauSensibilite: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    estDeclanche: { type: Boolean, default: false }
};

// Appareil Sécurité Global
const AppareilSecurite = Appareil.discriminator('SECURITE', new mongoose.Schema({
    ...proprietesSecuriteBase
}));

// Caméra de Sécurité
const Camera = Appareil.discriminator('CAMERA', new mongoose.Schema({
    ...proprietesSecuriteBase, 
    resolution: { type: String }, 
    estEnregistrement: { type: Boolean, default: false },
    stockageRestant: { type: Number },
    angleVue: { type: Number }
}));

// Porte Intelligente
const PorteIntelligent = Appareil.discriminator('PORTE', new mongoose.Schema({
    ...proprietesSecuriteBase,
    estVerrouillee: { type: Boolean, default: true },
    codePin: { type: String }
}));

// Capteur de Sécurité
const Capteur = Appareil.discriminator('CAPTEUR', new mongoose.Schema({
    ...proprietesSecuriteBase,
    typeCapteur: { type: String, enum: ['MOUVEMENT', 'FUMEE', 'HUMIDITE'] },
    dernierDetection: { type: Date },
    valeurActuelle: { type: Number }
}));

// Exportation de tous les modèles pour les utiliser dans les contrôleurs
module.exports = {
    Appareil,
    AppareilEclairage,
    AppareilThermique,
    AppareilMultimedia,
    AppareilMotorise,
    AppareilSecurite,
    Camera,
    PorteIntelligent,
    Capteur,
    Aspirateur
};