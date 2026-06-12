const mongoose = require('mongoose');

/**
 * @schema Regle
 * @description Modèle Mongoose représentant une règle d'automatisation basée sur des événements (Capteurs).
 */
const regleSchema = new mongoose.Schema({
  // Nom de la règle d'automatisation
  nomRegle: { 
    type: String, 
    required: true 
  },
  
  // 💡 CORRECTIF SÉCURITÉ : Liaison de la règle à l'utilisateur connecté (requis par le controller)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // État d'activation de la règle (Active / Inactive)
  etat: { 
    type: Boolean, 
    default: true 
  },

  // Niveau de priorité de la règle lors de l'exécution
  priorite: { 
    type: Number, 
    default: 1 
  },

  // Bloc de condition déclencheuse (Trigger basé sur la télémétrie)
  condition: {
    typeAppareil: String, // Type de l'appareil émetteur (ex: THERMIQUE, CAPTEUR)
    valeurSeuil: mongoose.Schema.Types.Mixed, // Valeur limite à comparer
    operateur: { 
      type: String, 
      enum: ['>', '<', '==', '!=', 'MATCH'], 
      default: '==' 
    }
  },

  // Action à exécuter si la condition ci-dessus est vraie
  action: {
    appareilCible: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appareil' 
    },
    commande: String, // Commande à envoyer (ex: ON, OFF)
  },

  // Date de création automatique de la règle
  dateCreation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Regle', regleSchema);