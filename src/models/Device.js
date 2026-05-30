const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'clima', 'light', 'lock', 'vacuum'
  status: { type: Boolean, default: false },           // true = ON, false = OFF
  value: { type: Number, default: 0 },                
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Device', DeviceSchema);