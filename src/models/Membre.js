const User = require('./User');
const mongoose = require('mongoose');

const Membre = User.discriminator('Membre', new mongoose.Schema({
    dateAdhesion: { type: Date, default: Date.now },
    alias: { type: String }
}));

module.exports = Membre ;