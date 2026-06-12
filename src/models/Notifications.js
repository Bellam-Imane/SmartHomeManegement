const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    titre : { type : String , required: true },
    message : { type: String, required: true },
    dateHeure: { type: Date, default: Date.now },
    type: { type: String, required: true }, // ex: ALERTE, INFO
    estLue: { type: Boolean, default: false },

    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Notification', notificationSchema);