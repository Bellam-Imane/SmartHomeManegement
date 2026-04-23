const User = require('./User');
const mongoose = require('mongoose');

const Invite = User.discriminator('Invite', new mongoose.Schema({
    dateExpriration: { type: Date, required: true },
    estCompteExpire: { type: Boolean, default: false}
}));

module.exports = Invite;