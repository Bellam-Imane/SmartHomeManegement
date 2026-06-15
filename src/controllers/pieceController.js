const Piece = require('../models/Piece');
const Maison = require('../models/Maison');
const Notification = require('../models/Notifications');

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

        // Recherche de la maison : proprietaire OU membre
        const maison = await Maison.findOne({
            $or: [
                { proprietaire: userId },
                { membres: userId }
            ]
        });
        
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

        const maison = await Maison.findOne({
            $or: [
                { proprietaire: userId },
                { membres: userId }
            ]
        });

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

        // ── NOTIFICATION: Room created ──
        try {
            const notif = await Notification.create({
                titre: 'Nouvelle pièce ajoutée',
                message: `La pièce "${nomPiece}" a été ajoutée avec succès.`,
                type: 'INFO',
                categorie: 'SYSTEME',
                priorite: 'LOW',
                utilisateur: userId
            });
            const io = req.app.get('io');
            if (io) {
                io.to(`user:${userId}`).emit('new_notification', {
                    _id: notif._id,
                    titre: notif.titre,
                    message: notif.message,
                    type: notif.type,
                    categorie: notif.categorie,
                    priorite: notif.priorite,
                    estLue: false,
                    dateCreation: notif.dateCreation
                });
                io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
            }
        } catch (notifErr) {
            console.error("Erreur notification (ajouterPiece):", notifErr.message);
        }

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
        const userId = req.user.id;

        // ── USER-SCOPED SECURITY: verify room belongs to user's maison ──
        const maison = await Maison.findOne({
            $or: [{ proprietaire: userId }, { membres: userId }]
        });

        if (!maison) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Aucune maison trouvée pour cet utilisateur.",
                data: null
            });
        }

        const piece = await Piece.findOne({ _id: id, maison: maison._id });
        if (!piece) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée ou accès non autorisé.",
                data: null
            });
        }

        Object.assign(piece, req.body);
        await piece.save();
        await piece.populate('appareils');

        // ── NOTIFICATION: Room updated ──
        try {
            const notif = await Notification.create({
                titre: 'Pièce modifiée',
                message: `La pièce "${piece.nomPiece}" a été mise à jour.`,
                type: 'INFO',
                categorie: 'SYSTEME',
                priorite: 'LOW',
                utilisateur: userId
            });
            const io = req.app.get('io');
            if (io) {
                io.to(`user:${userId}`).emit('new_notification', {
                    _id: notif._id,
                    titre: notif.titre,
                    message: notif.message,
                    type: notif.type,
                    categorie: notif.categorie,
                    priorite: notif.priorite,
                    estLue: false,
                    dateCreation: notif.dateCreation
                });
                io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
            }
        } catch (notifErr) {
            console.error("Erreur notification (updatePiece):", notifErr.message);
        }

        return res.status(200).json({
            success: true,
            type: "updated",
            message: "Pièce modifiée avec succès !",
            data: piece
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
        const userId = req.user.id;

        // ── USER-SCOPED SECURITY: verify room belongs to user's maison ──
        const maison = await Maison.findOne({
            $or: [{ proprietaire: userId }, { membres: userId }]
        });

        if (!maison) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Aucune maison trouvée pour cet utilisateur.",
                data: null
            });
        }

        const piece = await Piece.findOne({ _id: id, maison: maison._id });
        if (!piece) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée ou accès non autorisé.",
                data: null
            });
        }

        const pieceNom = piece.nomPiece;

        // Suppression des appareils liés
        await Appareil.deleteMany({ piece: id });
        console.log(`🧹 Suppression des appareils liés à la pièce ${id}`);

        await Piece.deleteOne({ _id: id });

        // ── NOTIFICATION: Room deleted ──
        try {
            const notif = await Notification.create({
                titre: 'Pièce supprimée',
                message: `La pièce "${pieceNom}" et ses appareils ont été supprimés.`,
                type: 'INFO',
                categorie: 'SYSTEME',
                priorite: 'MEDIUM',
                utilisateur: userId
            });
            const io = req.app.get('io');
            if (io) {
                io.to(`user:${userId}`).emit('new_notification', {
                    _id: notif._id,
                    titre: notif.titre,
                    message: notif.message,
                    type: notif.type,
                    categorie: notif.categorie,
                    priorite: notif.priorite,
                    estLue: false,
                    dateCreation: notif.dateCreation
                });
                io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
            }
        } catch (notifErr) {
            console.error("Erreur notification (deletePiece):", notifErr.message);
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
        const userId = req.user.id;

        // ── USER-SCOPED SECURITY: verify room belongs to user's maison ──
        const maison = await Maison.findOne({
            $or: [{ proprietaire: userId }, { membres: userId }]
        }).populate('proprietaire', 'profile email role')
          .populate('membres', 'profile email role')
          .populate('invites', 'profile email role');

        if (!maison) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Aucune maison trouvée pour cet utilisateur.",
                data: null
            });
        }

        const piece = await Piece.findOne({ _id: id, maison: maison._id }).populate('appareils');

        if (!piece) {
            return res.status(404).json({
                success: false,
                type: "error",
                message: "Pièce non trouvée ou accès non autorisé.",
                data: null
            });
        }

        // ── Build users list from maison members ──
        const utilisateurs = [];
        if (maison.proprietaire) {
            utilisateurs.push({ ...maison.proprietaire.toObject(), userType: 'Administrateur' });
        }
        if (maison.membres) {
            maison.membres.forEach(m => utilisateurs.push({ ...m.toObject(), userType: 'Membre' }));
        }
        if (maison.invites) {
            maison.invites.forEach(i => utilisateurs.push({ ...i.toObject(), userType: 'Invite' }));
        }

        return res.status(200).json({
            success: true,
            type: "success",
            message: "Détails de la pièce récupérés",
            data: {
                ...piece.toObject(),
                utilisateurs
            }
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