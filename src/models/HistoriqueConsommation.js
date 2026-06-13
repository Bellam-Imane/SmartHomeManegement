// src/models/HistoriqueConsommation.js
const mongoose = require('mongoose');

const historiqueConsommationSchema = new mongoose.Schema({
    annee: { type: Number, required: true },       // ex: 2026
    mois: { type: Number, required: true },        // ex: 5 (Pour Mai)
    consommationMensuelle: { type: Number, required: true }, // Consommation cumulée du mois écoulé
    productionMensuelle: { type: Number, default: 0.0 },     // Production cumulée du mois écoulé
    factureEstimee: { type: Number, default: 0.0 },          // Facture estimée en DH
    dateArchive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HistoriqueConsommation', historiqueConsommationSchema);