const Administrateur = require('../models/Administrateur');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

// Fonction pour enregistrer un administrateur
exports.registerAdmin = async (req, res) => {
    try {
        // Récupération des données du frontend
        const { email, motDePasse, nom, prenom, telephone } = req.body;

        // Vérifier si l'email existe déjà
        const userExists = await Administrateur.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // Génération du salt pour sécuriser le mot de passe
        const salt = await bcrypt.genSalt(10);

        // Hashage du mot de passe
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // Chercher le rôle ADMIN
        const adminRole = await Role.findOne({ nomRole: 'ADMIN' });

        // Création du nouvel administrateur
        const newAdmin = new Administrateur({
            email,
            motDePasse: hashedPassword,
            status: 'ACTIVE',
            estActif: true,
            profile: {
                nom,
                prenom,
                telephone
            },
            role: adminRole ? adminRole._id : null
        });

        // Sauvegarde dans MongoDB
        await newAdmin.save();

        // Réponse succès
        res.status(201).json({
            message: "Administrateur créé avec succès !",
            userId: newAdmin._id
        });

    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};