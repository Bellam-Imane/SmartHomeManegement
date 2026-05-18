const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import du modèle principal pour la vérification en base de données

/**
 * Middleware pour vérifier la validité du Token JWT et s'assurer que l'utilisateur est actif
 */
const verifyToken = async (req, res, next) => {
    // 1. Récupérer le token du header Authorization (Format: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Vérifier si le token existe dans la requête
    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        // 3. VÉRIFICATION : Vérifier la signature du token avec le secret du fichier .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. SÉCURITÉ : Vérifier si l'utilisateur existe toujours en base de données et s'il est actif
        const currentUser = await User.findById(decoded.id);
        
        if (!currentUser) {
            return res.status(401).json({ message: "Utilisateur introuvable. Accès refusé." });
        }

        if (currentUser.status && currentUser.status.toUpperCase() !== 'ACTIVE') {
            return res.status(401).json({ message: "Accès refusé. Ce compte est inactif ou bloqué." });
        }

        // 5. Associer les données décodées du token à l'objet 'req' pour les utiliser dans les contrôleurs suivants
        req.user = decoded;
        
        // 6. Passer au middleware ou contrôleur suivant (la route protégée)
        next();
    } catch (err) {
        // En cas de token invalide, modifié falsifié ou expiré
        return res.status(401).json({ message: "Token invalide ou expiré.", error: err.message });
    }
};

module.exports = verifyToken;