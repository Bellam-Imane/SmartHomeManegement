const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

/**
 * Middleware pour vérifier la validité du Token JWT
 */
const verifyToken = async (req, res, next) => {
    // 1. Récupérer le token du header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Vérifier si le token existe
    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        // 3. VÉRIFICATION du Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. SÉCURITÉ : Chercher l'utilisateur dans la base de données
        // On utilise User.findById car c'est le modèle parent
        const currentUser = await User.findById(decoded.id);
        
        if (!currentUser) {
            return res.status(401).json({ message: "Utilisateur introuvable. Accès refusé." });
        }

        // 5. Vérifier le status (Optionnel mais recommandé)
        if (currentUser.status && currentUser.status.toUpperCase() !== 'ACTIVE') {
            return res.status(401).json({ message: "Accès refusé. Compte inactif." });
        }

        /**
         * 6. IMPORTANT : On stocke les infos importantes dans req.user
         * req.user.id permettra de chercher l'utilisateur dans les autres contrôleurs
         */
        req.user = {
            id: currentUser._id,
            role: currentUser.role,
            email: currentUser.email
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ 
            message: "Token invalide ou expiré.", 
            error: err.message 
        });
    }
};

module.exports = verifyToken;