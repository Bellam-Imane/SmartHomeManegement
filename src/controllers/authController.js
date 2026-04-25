const Administrateur = require('../models/Administrateur');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');

// Fonction pour enregistrer un administrateur
exports.registerAdmin = async (req, res) => {
    try {
        const { email, motDePasse, nom, prenom, telephone } = req.body;

        const userExists = await Administrateur.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        const adminRole = await Role.findOne({ nomRole: 'ADMIN' });

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

        await newAdmin.save();

        res.status(201).json({
            message: "Administrateur créé avec succès !",
            userId: newAdmin._id
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};

// Fonction pour la connexion (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Administrateur.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(password, user.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        res.status(200).json({
            message: "Connexion réussie !",
            user: { id: user._id, email: user.email }
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};