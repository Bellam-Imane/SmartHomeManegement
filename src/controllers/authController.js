const Administrateur = require('../models/Administrateur');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

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


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Administrateur.findOne({ email: email.trim() });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const token = jwt.sign({ id: user._id }, "SECRET_KEY_A_CHANGER", { expiresIn: '15m' });

        const resetLink = `http://localhost:3000/reset-password/${token}`;
        console.log("🔗 Voici le lien :");
        console.log(resetLink); 

        const mailOptions = {
            from: 'mabelle.reichel72@ethereal.email',
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Cliquez sur ce lien pour changer votre mot de passe : ${resetLink}`
        };

        return res.status(200).json({ message: "Lien de réinitialisation envoyé par email !" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
};

// 3. La fonction qui change le mot de passe dans la base de données
exports.resetPassword = async (req, res) => {
    const { token } = req.params; 
    const { password } = req.body; 

    try {
        // 1. Vérifiez si le jeton est valide
        const decoded = jwt.verify(token, "SECRET_KEY_A_CHANGER");

        // 2. Hashage du nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Mise à jour dans MongoDB
        await Administrateur.findByIdAndUpdate(decoded.id, { motDePasse: hashedPassword });

        console.log("✅ Mot de passe mis à jour pour l'ID:", decoded.id);
        res.status(200).json({ message: "Mot de passe modifié avec succès !" });

    } catch (error) {
        console.error("Erreur ResetPassword:", error.message);
        res.status(400).json({ error: "Le lien est invalide ou a expiré." });
    }
};