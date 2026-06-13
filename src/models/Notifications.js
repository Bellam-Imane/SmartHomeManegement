const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    titre : { type : String , required: true },
    message : { type: String, required: true },
    dateHeure: { type: Date, default: Date.now },
    type: { 
        type: String, 
        required: true,
        enum: ['ALERTE', 'INFO', 'ENERGIE', 'SECURITE', 'AUTOMATION', 'SYSTEME', 'APPAREIL']
    },
    categorie: {
        type: String,
        enum: ['SECURITE', 'ENERGIE', 'SYSTEME', 'AUTOMATION', 'APPAREIL'],
        default: 'SYSTEME'
    },
    priorite: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    estLue: { type: Boolean, default: false },
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Index pour trier par date et filtrer par utilisateur
notificationSchema.index({ utilisateur: 1, dateHeure: -1 });
notificationSchema.index({ utilisateur: 1, estLue: 1 });

module.exports = mongoose.model('Notification', notificationSchema);