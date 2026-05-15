const Administrateur = require('../models/Administrateur');
const Maison = require('../models/Maison'); // Pour créer la maison automatiquement
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
        
        // 1. Vérifier si l'utilisateur existe déjà
        const userExists = await Administrateur.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        // 2. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // 3. Récupérer le rôle 'ADMIN' (Adapté EXACTEMENT à votre schéma Role)
        let adminRole = await Role.findOne({ nomRole: 'ADMIN' });
        if (!adminRole) {
            // Création propre avec uniquement les champs de votre schéma
            adminRole = await Role.create({ 
                nomRole: 'ADMIN',
                permissions: [] // Initialisé à vide
            }); 
        }

        // 4. Créer le nouvel Administrateur
        const newAdmin = new Administrateur({
            email: email.toLowerCase().trim(),
            motDePasse: hashedPassword,
            status: 'ACTIVE',
            estActif: true,
            profile: { nom, prenom, telephone },
            role: adminRole._id // Association du rôle
        });

        const savedAdmin = await newAdmin.save();
        console.log("✅ Administrateur créé avec succès ! ID:", savedAdmin._id);

        // 5. 🔥 Créer la Maison automatiquement (Adapté EXACTEMENT à votre schéma Maison)
        const newMaison = new Maison({
            nomMaison: `Maison de ${nom}`,
            adresse: "Adresse par défaut", // Requis par votre schéma
            proprietaire: savedAdmin._id,  // Référence vers l'ID de l'User (ref: 'User' est correct ici)
            membres: [],
            invites: []
        });

        const savedMaison = await newMaison.save();
        console.log("✅ Maison créée et liée à l'admin ! ID Maison:", savedMaison._id);

        // 6. Mettre à jour l'Admin avec la référence de sa maison
        await Administrateur.findByIdAndUpdate(savedAdmin._id, { maison: savedMaison._id });

        // 7. Retourner la réponse réussie (201 Created)
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

        // 1. Chercher l'administrateur par son email
        const user = await Administrateur.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // 2. Vérifier et comparer le mot de passe
        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        // 3. Générer le Token JWT contenant l'ID et le rôle
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 4. Retourner le token au Frontend
        res.status(200).json({
            message: "Connexion réussie !",
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

/**
 * Demande de réinitialisation du mot de passe (Forgot Password)
 */
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
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        
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

/**
 * Confirmer la réinitialisation du mot de passe (Reset Password)
 */
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