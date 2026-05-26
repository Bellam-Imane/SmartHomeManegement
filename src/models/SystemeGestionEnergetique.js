const mongoose = require('mongoose');

const systemeGestionEnergetiqueSchema = new mongoose.Schema({

  consommationTotale: { type: Number, default: 0.0 },
  

  productionTotale: { type: Number, default: 0.0 },
  
  // différence entre production et consomation
  balanceEnergetique: { type: Number, default: 0.0 },
  

  budgetMensuel: { type: Number, default: 0.0 },
  

  prixKWh: { type: Number, default: 1.05 },


  systemeAI: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SystemeAI' 
  },

  dateDerniereMiseAJour: { type: Date, default: Date.now },

  listeSources: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SourceEnergetique' 
  }]
});

module.exports = mongoose.model('SystemeGestionEnergetique', systemeGestionEnergetiqueSchema);