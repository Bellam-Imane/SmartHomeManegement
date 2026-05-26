const mongoose = require('mongoose');

/**
 * Modèle HubCentral
 * Représente l'unité centrale de contrôle de la maison intelligente.
 * Il assure la communication entre le système et tous les appareils connectés.
 */
const hubCentralSchema = new mongoose.Schema({
    // Nom personnalisé du Hub (ex: Hub Principal, Gateway Salon)
    nomHub: {
        type: String,
        required: true,
        default: "Main Smart Hub",
        trim: true
    },

    // Modèle matériel du fabricant 
    modele: {
        type: String,
        required: true
    },

    // Adresse IP locale pour la communication réseau
    adresseIP: {
        type: String,
        required: true,
        match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Veuillez entrer une adresse IP valide']
    },

    // Version du logiciel interne du Hub
    versionFirmware: {
        type: String,
        required: true
    },

    // État de fonctionnement actuel du Hub
    etat: {
        type: String,
        enum: ['ACTIF', 'INACTIF', 'MISE_A_JOUR', 'ERREUR'],
        default: 'ACTIF'
    },

    // Date de la dernière communication réussie avec les serveurs ou les appareils
    derniereSynchronisation: {
        type: Date,
        default: Date.now
    },

    /**
     * Relation One-to-One avec Maison
     * Chaque maison possède un seul Hub Central (Unique: true)
     */
    maison: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Maison',
        required: true,
        unique: true 
    },

    /**
     * Relation One-to-Many avec Appareil
     * Le Hub gère et contrôle une liste d'appareils connectés
     */
    appareils: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appareil'
    }]
}, { 
    // Ajoute automatiquement les champs createdAt et updatedAt
    timestamps: true 
});



module.exports = mongoose.model('HubCentral', hubCentralSchema);