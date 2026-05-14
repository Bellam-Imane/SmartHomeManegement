const mongoose = require('mongoose');

const sceneSchema = new mongoose.Schema({
  nomScene: { 
    type: String, 
    required: true 
  },
  

  description: String,


  actions: [{
    appareilId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appareil',
      required: true
    },
    commande: { 
      type: String, 
      required: true 
    }
  }],


  estActif: { 
    type: Boolean, 
    default: false 
  },


  icone: { 
    type: String, 
    default: 'default-scene.png' 
  },

  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Scene', sceneSchema);