const User = require('./User');
const mongoose = require('mongoose');

const Administrateur = User.discriminator('Administrateur', new mongoose.Schema({
    dateNomination: { type: Date, default: Date.now } ,
    numUrgenceMaison: { type: String } 
})) ;

module.exports = Administrateur ; 
