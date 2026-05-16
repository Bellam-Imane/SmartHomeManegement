const mongoose = require('mongoose');

const systemeAutomationSchema = new mongoose.Schema({
 
  listeRegles: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Regle' 
  }],

 
  listeScenes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Scene' 
  }],


  estEnModeAutomatique: { 
    type: Boolean, 
    default: true 
  },

  
  logActive: [{
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],

  dateDerniereVerification: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('SystemeAutomation', systemeAutomationSchema);