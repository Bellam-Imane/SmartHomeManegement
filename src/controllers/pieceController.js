const Piece = require('../models/Piece');
const Maison = require('../models/Maison');

// 🌟 INTEGRATION DIRECTE : On charge le modèle depuis son fichier pour forcer l'enregistrement et l'exportation
const Appareil = require('../models/Appareil'); 
const mongoose = require('mongoose');

/**
 * Récupérer toutes les pièces de la maison de l'utilisateur connecté
 * @route GET /api/pieces/all
 */
exports.getPieces = async (req, res) => {
    try {
        const userId = req.user.id;

        // Recherche de la maison appartenant à l'utilisateur connecté
        const maison = await Maison.findOne({ proprietaire: userId });
        
        if (!maison) {
            return res.status(404).json({ 
                success: false,
                message: "Aucune maison trouvée pour cet utilisateur. Veuillez d'abord créer une maison." 
            });
        }

        // Récupération de toutes les pièces liées à cette maison avec leurs appareils peuplés
        const pieces = await Piece.find({ maison: maison._id }).populate('appareils');

        return res.status(200).json({
            success: true,
            count: pieces.length,
            pieces: pieces
        });

    } catch (error) {
        console.error("Erreur dans getPieces:", error.message);
        return res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de la récupération des pièces.", 
            error: error.message 
        });
    }
};

/**
 * Ajouter une nouvelle pièce liée à la maison de l'utilisateur connecté
 * @route POST /api/pieces/ajouter
 */
exports.ajouterPiece = async (req, res) => {
    try {
        const { nomPiece, type, superficie, etage } = req.body;
        const userId = req.user.id;

        // Validation stricte des champs obligatoires
        if (!nomPiece || !type || !superficie) {
            return res.status(400).json({ 
                success: false, 
                message: "Le nom, le type et la superficie sont obligatoires." 
            });
        }

        // Récupération de la maison pour y lier automatiquement la nouvelle pièce
        const maison = await Maison.findOne({ proprietaire: userId });
        if (!maison) {
            return res.status(404).json({ 
                success: false, 
                message: "Impossible d'ajouter une pièce : Aucune maison trouvée pour cet utilisateur." 
            });
        }

        // Création de l'instance de la pièce
        const nouvellePiece = new Piece({
            nomPiece,
            type,
            superficie,
            etage: etage || 0,
            maison: maison._id, 
            appareils: []
        });

        // Sauvegarde dans la base de données
        await nouvellePiece.save();

        return res.status(201).json({
            success: true,
            message: "Pièce ajoutée avec succès !",
            piece: nouvellePiece
        });

    } catch (error) {
        console.error("Erreur dans ajouterPiece:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur serveur lors de l'ajout de la pièce.", 
            error: error.message 
        });
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

        const pieceModifiee = await Piece.findByIdAndUpdate(id, updates, { new: true }).populate('appareils');
        
        if (!pieceModifiee) {
            return res.status(404).json({ success: false, message: "Pièce non trouvée." });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Pièce modifiée avec succès !", 
            piece: pieceModifiee 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Erreur lors de la modification.", error: error.message });
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
            return res.status(404).json({ success: false, message: "Pièce non trouvée." });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Pièce supprimée avec succès !" 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression.", error: error.message });
    }
};

/**
 * Récupérer les détails complets d'une pièce spécifique avec ses appareils
 * @route GET /api/pieces/:id
 */
exports.getPieceDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const piece = await Piece.findById(id).populate('appareils');
        
        if (!piece) {
            return res.status(404).json({ 
                success: false, 
                message: "Pièce non trouvée." 
            });
        }

        return res.status(200).json({ 
            success: true, 
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