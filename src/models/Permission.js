const mongoose = require('mongoose');

//Modèle basé sur la classe Permission 
const permissionSchema= new mongoose.Schema({
    //Nom de la permission(ex: Gérer les capteurs, accès Caméra)
    nomPermission: {
        type: String,
        required: true,
        unique: true,
        trim: true 
    },

    code: {
        type: String,
        required: true,
        uppercase: true,
        unique : true
    },

    categorie: {
        type: String, //(ECLAIRAGE, SECURITE, etc.)
        required: true,
        trim: true
    }


});

module.exports =  mongoose.model('Permission', permissionSchema) ;