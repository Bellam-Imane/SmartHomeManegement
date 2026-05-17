const Piece = require('../models/Piece');
const Maison = require('../models/Maison');

/**
 * Récupérer toutes les pièces de la maison de l'utilisateur connecté
 * @route GET /api/pieces/all
 */
exports.getPieces = async (req, res) => {
    try {
        const userId = req.user.id; // Récupération de l'ID via le middleware de session

        // 1. Chercher la maison qui appartient à l'utilisateur connecté
        const maison = await Maison.findOne({ proprietaire: userId });
        
        if (!maison) {
            return res.status(404).json({ message: "Aucune maison trouvée pour cet utilisateur." });
        }

        // 2. Récupérer toutes les pièces associées à cette maison avec leurs appareils peuplés
        const pieces = await Piece.find({ maison: maison._id }).populate('appareils');

        // 3. Envoyer la liste des pièces au Frontend avec une structure compatible
        res.status(200).json({
            success: true,
            count: pieces.length,
            pieces: pieces
        });

    } catch (error) {
        console.error("Erreur dans getPieces:", error.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération.", error: error.message });
    }
};

/**
 * Ajouter une nouvelle pièce liée à la maison de l'utilisateur connecté
 * @route POST /api/pieces
 */
exports.ajouterPiece = async (req, res) => {
    try {
        const { nomPiece, type, superficie, etage } = req.body;
        const userId = req.user.id; 

        // Validation des champs obligatoires
        if (!nomPiece || !type || !superficie) {
            return res.status(400).json({ message: "Le nom, le type et la superficie sont obligatoires." });
        }

        // Vérification de l'existence de la maison
        const maison = await Maison.findOne({ proprietaire: userId });
        if (!maison) {
            return res.status(404).json({ message: "Aucune maison trouvée pour cet utilisateur." });
        }

        // Création de l'instance de la nouvelle pièce
        const nouvellePiece = new Piece({
            nomPiece,
            type,
            superficie,
            etage: etage || 0,
            maison: maison._id,
            appareils: [] // Initialisation avec un tableau d'appareils vide
        });

        // Sauvegarde dans la base de données
        await nouvellePiece.save();

        // Envoi de la réponse avec l'attribut 'success' requis par le Frontend
        res.status(201).json({
            success: true,
            message: "Pièce ajoutée avec succès !",
            piece: nouvellePiece
        });

    } catch (error) {
        console.error("Erreur dans ajouterPiece:", error.message);
        res.status(500).json({ message: "Erreur serveur lors de l'ajout.", error: error.message });
    }
};

/**
 * Modifier les informations d'une pièce spécifique
 * @route PUT /api/pieces/:id
 */
exports.updatePiece = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Mise à jour de la pièce et population directe des appareils
        const pieceModifiee = await Piece.findByIdAndUpdate(id, updates, { new: true }).populate('appareils');
        
        if (!pieceModifiee) {
            return res.status(404).json({ message: "Pièce non trouvée." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Pièce modifiée !", 
            piece: pieceModifiee 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification.", error: error.message });
    }
};

/**
 * Supprimer une pièce définitivement de la base de données
 * @route DELETE /api/pieces/:id
 */
exports.deletePiece = async (req, res) => {
    try {
        const { id } = req.params;

        const pieceSupprimee = await Piece.findByIdAndDelete(id);
        
        if (!pieceSupprimee) {
            return res.status(404).json({ message: "Pièce non trouvée." });
        }

        res.status(200).json({ 
            success: true, 
            message: "Pièce supprimée avec succès !" 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
};

/**
 * Récupérer les détails complets d'une pièce spécifique avec ses appareils (Résolution du bug d'affichage)
 * @route GET /api/pieces/:id
 */
exports.getPieceDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // CORRECTION MAJEURE : Ajout du .populate('appareils') pour charger les objets complets des appareils
        const piece = await Piece.findById(id).populate('appareils');
        
        if (!piece) {
            return res.status(404).json({ 
                success: false, 
                message: "Pièce non trouvée." 
            });
        }

        // ALIGNEMENT FRONTEND : Envoi de l'objet sous les clés 'data' et 'piece' pour satisfaire tous les hooks du Frontend
        return res.status(200).json({ 
            success: true, 
            data: piece, 
            piece: piece 
        });

    } catch (error) {
        console.error("Erreur critique dans getPieceDetails:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des détails.", 
            error: error.message 
        });
    }
};