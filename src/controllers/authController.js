const Administrateur = require('../models/Administrateur');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

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


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Administrateur.findOne({ email: email.trim() });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Configuration du « transporteur » (Transporter) en utilisant votre compte Gmail et le code que vous avez obtenu
        const transporter = nodemailer.createTransport({
        service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
});

        const token = jwt.sign({ id: user._id }, "SECRET_KEY_A_CHANGER", { expiresIn: '15m' });
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: user.email,               
            subject: 'Réinitialisation de votre mot de passe',
            text: `Bonjour, Cliquez sur ce lien pour changer votre mot de passe : ${resetLink}`
        };
        // Envoyez l’e-mail correctement
        await transporter.sendMail(mailOptions);

        console.log("📧 Email envoyé avec succès à :", user.email);
        return res.status(200).json({ message: "Lien de réinitialisation envoyé par email !" });

    } catch (err) {
        console.error("Erreur Nodemailer:", err);
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