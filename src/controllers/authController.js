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

        let adminRole = await Role.findOne({ nomRole: 'ADMIN' });

        const newAdmin = new Administrateur({
            email,
            motDePasse: hashedPassword,
            status: 'ACTIVE',
            estActif: true,
            profile: { nom, prenom, telephone },
            role: adminRole ? adminRole._id : null
        });

        await newAdmin.save();
        res.status(201).json({ message: "Administrateur créé avec succès !", userId: newAdmin._id });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Fonction pour la connexion (Login) - ✅ VERSION NETTOYÉE ET SÉCURISÉE
exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Recherche de l'utilisateur
        const user = await Administrateur.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Comparaison du mot de passe
        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // ✅ GÉNÉRATION DU TOKEN (Utilise JWT_SECRET du fichier .env)
        const token = jwt.sign(
            { id: user._id, role: user.role || 'ADMIN' },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// --- Routes Riham & Imane (Gardées intactes) ---
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Administrateur.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Bonjour, Cliquez sur ce lien : ${resetLink}`
        };
        
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Lien envoyé !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur email" });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await Administrateur.findByIdAndUpdate(decoded.id, { motDePasse: hashedPassword });
        res.status(200).json({ message: "Mot de passe modifié !" });
    } catch (error) {
        res.status(400).json({ error: "Lien invalide." });
    }
};