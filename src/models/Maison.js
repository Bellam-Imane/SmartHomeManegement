const mongoose = require('mongoose');

const maisonSchema = new mongoose.Schema({
    nomMaison: { type: String, required: true },
    adresse: { type: String, required: true },
    superficieTotale: {type: Number },
    nbEtages: { type: Number, default: 1 },

    proprietaire: {
        type: mongoose.Schema.Types.ObjextId,
        ref: 'User',
        required: true,
    }
},{ timestamps: true });

module.exports = mongoose.model('Maison', maisonSchema);