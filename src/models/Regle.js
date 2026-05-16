const mongoose = require('mongoose');

const regleSchema = new mongoose.Schema({
  nomRegle: { 
    type: String, 
    required: true 
  },
  
 
  etat: { 
    type: Boolean, 
    default: true 
  },

  
  priorite: { 
    type: Number, 
    default: 1 
  },

 
  condition: {
    typeAppareil: String, 
    valeurSeuil: mongoose.Schema.Types.Mixed, 
    operateur: { 
      type: String, 
      enum: ['>', '<', '==', '!=', 'MATCH'], 
      default: '==' 
    }
  },

  // Action
  action: {
    appareilCible: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appareil' 
    },
    commande: String, 
  },


  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Regle', regleSchema);