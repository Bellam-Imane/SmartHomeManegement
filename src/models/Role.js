const mongoose = require('mongoose');

//--- Classe Role ---
const roleSchema = new mongoose.Schema({
    // Type de role (ADMIN, MEMBRE, INVITE) - correspond à RoleType 
    nomRole: {
        type: String,
        required: true,
        enum: ['ADMIN', 'MEMBRE', 'INVITE'],
        unique: true 
    },

    permissions: [{
        permissionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        },

        dateAttribution: {
            type: Date, 
            default: Date.now
        },
        
        estActive: {
            type: Boolean,
            default: true
        }

    }]
    
});

module.exports = mongoose.model('Role', roleSchema);