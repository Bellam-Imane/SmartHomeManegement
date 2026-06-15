const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  //--- Classe Utilisateur ---
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  motDePasse: {
    type: String,
    minlength: 6,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },

  //Etat de l'utilisateur (userStatus)
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING'],
    default: 'PENDING'
  },


  // --- Classe Profile (Intégrée en tant q'objet) ---
  profile: {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    photo: { type: String },
    telephone: { type: String }
  },

  // Preferences
  preferences: {
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      lon: { type: String, default: "" },
      lat: { type: String, default: "" },
    },
    twoFactor: { type: Boolean, default: false },
    emergencyContact: { type: String, default: "" },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: "Français" },
    // ---(Security Settings) ---
  securitySettings: {
    alarmActive: { type: Boolean, default: true },
    locks: {
      entree: { type: Boolean, default: true },
      garage: { type: Boolean, default: true },
      fenetre: { type: Boolean, default: false },
      allee: { type: Boolean, default: true }
    },
    sensors: {
      mouvement: { type: Boolean, default: true },
      fumee: { type: Boolean, default: true }
    }
  },
    notifications: {
      security: { mobile: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
      system: { mobile: { type: Boolean, default: true }, email: { type: Boolean, default: true } },
      energy: { mobile: { type: Boolean, default: true }, email: { type: Boolean, default: false } },
      device: { mobile: { type: Boolean, default: true }, email: { type: Boolean, default: true } }
    }
    
  },

  // --- Relation avec la classe Role ---
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role', //Lien vers le modèle Role 
    required: true
  },

  maison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maison'
  }

}, {
  timestamps: true, // Pour garder une trace des modifications 
  discriminatorKey: 'userType'
});

module.exports = mongoose.model('User', userSchema);