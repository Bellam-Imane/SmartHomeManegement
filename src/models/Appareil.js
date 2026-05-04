const mongoose = require('mongoose');
const { discriminator, applyTimestamps } = require('./Administrateur');

// discriminatorsKey: 'typeAppareil'
const baseOptions = {
    discriminatorKey: 'typeAppareil',
    collection: 'appareils',
    timestamps: true
};


const appareilSchema = new mongoose.Schema({
    nomAppareil:{
        type: String,
        required: true,
        trim: true
    },
    marque: {
        type: String
    },
    status:{
        type: String,
        enum: ['ENLIGNE','HORSLIGNE'],
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

// Appareil Eclairage
const AppareilEclairage = Appareil.discriminator('ECLAIRAGE', new mongoose.Schema({
    intensite: { type: Number, default: 100},
    couleur: { type:String, default: '#FFFFFF'}
}));

// Appareil Thermique
const AppareilThermique = Appareil.discriminator('THERMIQUE', new mongoose.Schema({
    temperatureActuelle: { type: Number },
    temperatureCible: { type: Number },
    mode: { type: String, enum: ['CHAUD','FROID','AUTO']}
}));

// Appareil Multimedia
const AppareilMultimedia = Appareil.discriminator('MULTIMEDIA', new mongoose.Schema({
    volume: { type: Number, min: 0, max: 100 },
    source: { type: String , enum: ['HDMI', 'Bluetooth', 'WIFI']},
    application: {
        type: String ,
        enum: ['TV','YOUTOUB','NETFLIX','SPOTIFY','NONE'],
        default: 'NONE'
    },
    chaineActuelle: { type: Number},
    estMuet: { type: Boolean, default: false },
    niveauLuminosite: { type: Number, default: 50}
}));

// Appareil Motorise 
const AppareilMotorise = Appareil.discriminator('MOTORISE', new mongoose.Schema({
    pourcentageOuverture: { type: Number, min: 0 , max: 100, default: 0 },
    estVerrouille: { type: Boolean, default: true }
}));

// Appareil Securite
const AppareilSecurite  = Appareil.discriminator('SECURITE', new mongoose.Schema({
    niveauSensibilite: { type: String, enum: ['LOW','MEDIUM','HIGH'], default:'MEDIUM'},
    estDeclanche: { type: Boolean, default: false }
}));

//Appareil Securite : Camera
const Camera = AppareilSecurite.discriminator('CAMERA', new mongoose.Schema({
    resolution: { type: String },  //Définit la qualité d'image ou la précision de capture vidéo (ex: Full HD, UHD)
    estEnregistrement: { type: Boolean, default: false },
    stockageRestant : { type: Number },
    angleVue: { type: Number }
}));

//Appareil Securite : Porte
const PorteIntelligent = AppareilSecurite.discriminator('PORTE', new mongoose.Schema({
    estVerrouillee : { type: Boolean, default: true },
    codePin: { type: String }
}));

//Appareil Securite : Capteur
const Capteur = AppareilSecurite.discriminator('CAPTEUR', new mongoose.Schema({
    typeCapteur: { type: String, enum: ['MOUVEMENT', 'FUMEE', 'HUMIDITE']},
    dernierDetection : { type: Date },
    valeurActuelle : { type : Number }
}));

module.exports= {
    Appareil,
    AppareilEclairage,
    AppareilThermique,
    AppareilMultimedia,
    AppareilMotorise,
    AppareilSecurite,
    Camera,
    PorteIntelligent,
    Capteur
};

