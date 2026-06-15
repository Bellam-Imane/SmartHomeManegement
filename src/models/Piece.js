const mongoose = require('mongoose');

// 🌟 FORCE COUPLING : On s'assure que le fichier Appareil est lu complètement
require('./Appareil'); 

const pieceSchema = new mongoose.Schema({
    nomPiece: {

        type: String,
        required: true,
        trim: true
    },

    type: {
        type: String,
        required: true,
        enum: ['Salon', 'Chambre à coucher', 'Cuisine', 'Bureau', 'Autre'],
        default: 'Salon'
    },

    superficie: {

        type: Number,

        required: true
    },


    etage: {
        type: Number,
        default: 0  // 0 pour le rez-de-chaussée
    },

    maison: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Maison',

        required: true
    },

    appareils: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appareil'
    }]
}, { timestamps: true });

// Exportation unique conforme
module.exports = mongoose.model('Piece', pieceSchema);

