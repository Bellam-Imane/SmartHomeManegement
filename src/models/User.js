const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  //--- Classe Utilisateur ---
  email: {
    type : String,
    required: true,
    unique: true,
    lowercase: true 
  },
  motDePasse: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  estActif: {
    type : Boolean,
    default: false
  },

  //Etat de l'utilisateur (userStatus)
  status: {
    type : String,
    enum : ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'],
    default: 'PENDING'
  },


  // --- Classe Profile (Intégrée en tant q'objet) ---
  profile: {
    nom: {type: String, required: true } ,
    prenom: { type : String, required: true } ,
    photo: {type: String },
    telephone: {type: String }
  } ,

  // --- Relation avec la classe Role ---
  role: {
    type: mongoose.Schema.Types.ObjectId ,
    ref: 'Role' //Lien vers le modèle Role 
  }
},{
  timestamps: true, // Pour garder une trace des modifications 
  discriminatorKey: 'userType'
});

module.exports = mongoose.model('User', userSchema);