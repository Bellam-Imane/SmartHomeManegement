const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
   
}, { timestamps: true });

module.exports = mongoose.model('Administrateur', schema, 'administrateurs');