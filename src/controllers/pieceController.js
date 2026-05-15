const Piece = require('../models/Piece');
const Maison = require('../models/Maison');

/**
 * Récupérer toutes les pièces de la maison de l'utilisateur connecté
 */
exports.getPieces = async (req, res) => {
    try {
        const userId = req.user.id; // Récupération de l'ID via le middleware de session

        // 1. Chercher la maison qui appartient à l'utilisateur connecté
        const maison = await Maison.findOne({ proprietaire: userId });
        
        if (!maison) {
            return res.status(404).json({ message: "Aucune maison trouvée pour cet utilisateur." });
        }

        // 2. Récupérer toutes les pièces associées à cette maison
        const pieces = await Piece.find({ maison: maison._id });

        // 3. Envoyer la liste des pièces au Frontend
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
 */
exports.ajouterPiece = async (req, res) => {
    try {
        const { nomPiece, type, superficie, etage } = req.body;
        const userId = req.user.id; 

        if (!nomPiece || !type || !superficie) {
            return res.status(400).json({ message: "Le nom, le type et la superficie sont obligatoires." });
        }

        const maison = await Maison.findOne({ proprietaire: userId });
        if (!maison) {
            return res.status(404).json({ message: "Aucune maison trouvée pour cet utilisateur." });
        }

        const nouvellePiece = new Piece({
            nomPiece,
            type,
            superficie,
            etage: etage || 0,
            maison: maison._id,
            appareils: []
        });

        await nouvellePiece.save();

        res.status(201).json({
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
 */
exports.updatePiece = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const pieceModifiee = await Piece.findByIdAndUpdate(id, updates, { new: true });
        
        if (!pieceModifiee) {
            return res.status(404).json({ message: "Pièce non trouvée." });
        }

        res.status(200).json({ message: "Pièce modifiée !", piece: pieceModifiee });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification.", error: error.message });
    }
};

/**
 * Supprimer une pièce définitivement
 */
exports.deletePiece = async (req, res) => {
    try {
        const { id } = req.params;

        const pieceSupprimee = await Piece.findByIdAndDelete(id);
        
        if (!pieceSupprimee) {
            return res.status(404).json({ message: "Pièce non trouvée." });
        }

        res.status(200).json({ message: "Pièce supprimée avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
};

/**
 * Récupérer les détails d'une pièce et ses appareils
 */
exports.getPieceDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const piece = await Piece.findById(id).populate('appareils');
        
        if (!piece) {
            return res.status(404).json({ message: "Pièce non trouvée." });
        }

        res.status(200).json({ success: true, piece });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des détails.", error: error.message });
    }
};