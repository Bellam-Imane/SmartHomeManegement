const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Récupérer le token du header Authorization (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Vérifier si le token existe
    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Token manquant." });
    }

    try {
        // 3. VÉRIFICATION : Utilise UNIQUEMENT le secret du fichier .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Ajouter les données du user décodées à la requête
        req.user = decoded;
        
        // 5. Passer à la suite (la route protégée)
        next();
    } catch (err) {
        // En cas de token invalide ou expiré
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

module.exports = verifyToken;