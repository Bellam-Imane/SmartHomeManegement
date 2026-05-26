const mongoose = require('mongoose');


const options = { discriminatorKey: 'typeSource', collection: 'sources' };

const sourceEnergetiqueSchema = new mongoose.Schema({
  nomSource: String,      
  capaciteMax: Number,   
  etatActuel: { 
    type: String, 
    enum: ['ACTIF', 'INACTIF', 'MAINTENANCE'], 
    default: 'ACTIF' 
  }
}, options);

const SourceEnergetique = mongoose.model('SourceEnergetique', sourceEnergetiqueSchema);
module.exports = SourceEnergetique;