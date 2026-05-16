const mongoose = require('mongoose');

const pieceSchema = new mongoose.Schema({
    nomPiece:{
        type: String,
        required: true,
        trim: true
    },

    type:{
        type: String,
        required: true,
        enum: ['Salon','Chambre à coucher','Cuisine','Bureau','Autre'],
        default:'Salon'
    },

    superficie:{
        type: String,
        required: true
    },

    etage:{
        type: Number,
        default: 0  // 0 pour le rez-de-dhaussée
    },

    maison:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Maison',
        required: true
    },

    appareils: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Appareil'

    }]

},{timestamps: true});

module.exports = mongoose.model('Piece', pieceSchema) ;