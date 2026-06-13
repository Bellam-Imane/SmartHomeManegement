const Piece = require('../models/Piece');
const Maison = require('../models/Maison');

// 🌟 INTEGRATION DIRECTE : Chargement du modèle Appareil
const { Appareil } = require('../models/Appareil'); 
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
                type: "error",
                message: "Aucune maison trouvée pour cet utilisateur. Veuillez d'abord créer une maison.",
                data: null
            });
        }

        // Récupération des pièces avec leurs appareils
        const pieces = await Piece.find({ maison: maison._id }).populate('appareils');

        return res.status(200).json({
            success: true,
            type: "success",
            message: "Pièces récupérées avec succès",
            data: {
                count: pieces.length,
                pieces: pieces
            }
        });

    } catch (error) {
        console.error("Erreur dans getPieces:", error.message);

        return res.status(500).json({
            success: false,
            type: "error",
            message: "Erreur serveur lors de la récupération des pièces.",
            data: null,
            error: error.message
        });
    }
};


/**
 * Ajouter une nouvelle pièce
 * @route POST /api/pieces/ajouter
 */
exports.ajouterPiece = async (req, res) => {
    try {
        const { nomPiece, type, superficie, etage } = req.body;
        const userId = req.user.id;

        // Validation
        if (!nomPiece || !type || !superficie) {
            return res.status(400).json({
                success: false,
                type: "validation_error",
                message: "Le nom, le type et la superficie sont obligatoires.",
                data: null
            });
        }

        const maison = await Maison.findOne({ proprietaire: userId });

        if (!maison) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Impossible d'ajouter une pièce : aucune maison trouvée.",
                data: null
            });
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

        return res.status(201).json({
            success: true,
            type: "created",
            message: "Pièce ajoutée avec succès !",
            data: nouvellePiece
        });

    } catch (error) {
        console.error("Erreur dans ajouterPiece:", error.message);

        return res.status(500).json({
            success: false,
            type: "error",
            message: "Erreur serveur lors de l'ajout de la pièce.",
            data: null,
            error: error.message
        });
    }
};


/**
 * Modifier une pièce
 * @route PUT /api/pieces/:id
 */
exports.updatePiece = async (req, res) => {
    try {
        const { id } = req.params;

        const pieceModifiee = await Piece.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).populate('appareils');

        if (!pieceModifiee) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            type: "updated",
            message: "Pièce modifiée avec succès !",
            data: pieceModifiee
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            message: "Erreur lors de la modification.",
            data: null,
            error: error.message
        });
    }
};


/**
 * Supprimer une pièce (cascade appareils)
 * @route DELETE /api/pieces/:id
 */
exports.deletePiece = async (req, res) => {
    try {
        const { id } = req.params;

        // Suppression des appareils liés
        await Appareil.deleteMany({ piece: id });

        console.log(`🧹 Suppression des appareils liés à la pièce ${id}`);

        const pieceSupprimee = await Piece.findByIdAndDelete(id);

        if (!pieceSupprimee) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            type: "deleted",
            message: "Pièce et appareils supprimés avec succès !",
            data: null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            type: "error",
            message: "Erreur lors de la suppression.",
            data: null,
            error: error.message
        });
    }
};


/**
 * Récupérer les détails d'une pièce
 * @route GET /api/pieces/:id
 */
exports.getPieceDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const piece = await Piece.findById(id).populate('appareils');

        if (!piece) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée.",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            type: "success",
            message: "Détails de la pièce récupérés",
            data: piece
        });

    } catch (error) {
        console.error("Erreur getPieceDetails:", error.message);

        return res.status(500).json({
            success: false,
            type: "error",
            message: "Erreur lors de la récupération des détails.",
            data: null,
            error: error.message
        });
    }
};