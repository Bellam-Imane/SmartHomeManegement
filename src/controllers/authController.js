const Administrateur = require('../models/Administrateur');
const User = require('../models/User'); // Import du modèle de base
const Maison = require('../models/Maison'); 
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

/**
 * Enregistrer un administrateur et créer sa maison automatiquement
 */
exports.registerAdmin = async (req, res) => {
    try {
        const { email, motDePasse, nom, prenom, telephone } = req.body;
        
        // 1. Vérifier si l'utilisateur existe déjà (on cherche dans User pour être sûr)
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // 2. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // 3. Récupérer ou créer le rôle 'ADMIN'
        let adminRole = await Role.findOne({ nomRole: 'ADMIN' });
        if (!adminRole) {
            adminRole = new Role({ 
                nomRole: 'ADMIN',
                permissions: [] 
            });
            await adminRole.save();
        }

        // 4. Créer le nouvel Administrateur (Respecte la structure de ton schéma)
        const newAdmin = new Administrateur({
            email: email.toLowerCase().trim(),
            motDePasse: hashedPassword,
            status: 'ACTIVE',
            estActif: true,
            profile: { 
                nom: nom, 
                prenom: prenom, 
                telephone: telephone 
                // La photo sera vide par défaut au début
            },
            role: adminRole._id 
        });

        const savedAdmin = await newAdmin.save();

        // 5. Créer la Maison automatiquement
        const newMaison = new Maison({
            nomMaison: `Maison de ${nom}`,
            adresse: "Adresse par défaut", 
            proprietaire: savedAdmin._id, 
            membres: [],
            invites: []
        });

        const savedMaison = await newMaison.save();

        // 6. Mettre à jour l'Admin avec l'ID de sa maison
        await Administrateur.findByIdAndUpdate(savedAdmin._id, { maison: savedMaison._id });

        res.status(201).json({ 
            message: "Administrateur et Maison créés avec succès !", 
            userId: savedAdmin._id,
            maisonId: savedMaison._id
        });

    } catch (error) {
        console.error("❌ Erreur dans registerAdmin:", error.message);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription", error: error.message });
    }
};

/**
 * Connexion de l'utilisateur (Login)
 */
exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // On cherche dans Administrateur
        const user = await Administrateur.findOne({ email: email.toLowerCase().trim() }).populate('role');
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // Génération du Token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role ? user.role.nomRole : 'ADMIN' },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Retourner les infos (On accède bien à user.profile.nom)
        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                nom: user.profile.nom, 
                prenom: user.profile.prenom, 
                photo: user.profile.photo 
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * Mot de passe oublié
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.trim() });
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `<p>Bonjour, Cliquez ici pour réinitialiser : <a href="${resetLink}">${resetLink}</a></p>`
        };
        
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Lien envoyé !" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
    }
};

/**
 * Reset Password
 */
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await User.findByIdAndUpdate(decoded.id, { motDePasse: hashedPassword });
        res.status(200).json({ message: "Mot de passe modifié avec succès !" });
    } catch (error) {
        res.status(400).json({ error: "Lien invalide ou expiré." });
    }
};