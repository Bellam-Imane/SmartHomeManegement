const User = require('./User');
const mongoose = require('mongoose');

const Administrateur = User.discriminator(
   'Administrateur',
   new mongoose.Schema({}, { timestamps: true })
);

module.exports = Administrateur;