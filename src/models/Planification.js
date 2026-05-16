const mongoose = require('mongoose');

const planificationSchema = new mongoose.Schema({

  idAppareil: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appareil', 
    required: true 
  },


  heureDebut: { 
    type: String, 
    required: true 
  },
  heureFin: { 
    type: String 
  },

  jourRepetition: [{ 
    type: String,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  }],


  estActive: { 
    type: Boolean, 
    default: true 
  },

 
  nomPlan: String,

  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Planification', planificationSchema);