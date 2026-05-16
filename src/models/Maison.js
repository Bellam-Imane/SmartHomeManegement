const mongoose = require('mongoose');

// 1. Définition du Schema en premier
const maisonSchema = new mongoose.Schema({
   nomMaison: {
      type: String,
      required: true
   },

   adresse: {
      type: String,
      required: true
   },

   superficieTotale: Number,

   nbEtages: {
      type: Number,
      default: 1
   },

   proprietaire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   membres: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   }],

   invites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   }]
}, { timestamps: true });

// 2. Création du modèle à partir du Schema en dernier
const Maison = mongoose.model('Maison', maisonSchema);

// 3. Export du modèle
module.exports = Maison;