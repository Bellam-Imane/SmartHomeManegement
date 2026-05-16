const User = require('./User');
const mongoose = require('mongoose');

const Invite = User.discriminator('Invite', new mongoose.Schema({
    dateExpiration: { type: Date, required: true },
    estCompteExpire: { type: Boolean, default: false}
}));

module.exports = Invite;