const express = require('express');
const router = express.Router();
const pieceController = require('../controllers/pieceController');
const auth = require('../middleware/authMiddleware'); // Importation du protecteur

// --- Routes pour la gestion des pièces ---

// Ajouter une pièce (Protégé : seul l'admin connecté peut ajouter à sa maison)
router.post('/add', auth, pieceController.createPiece);

// Récupérer toutes les pièces (Protégé : l'admin ne voit que ses propres pièces)
router.get('/', auth, pieceController.getAllPieces);

// Modifier une pièce spécifique par son ID
router.put('/:id', auth, pieceController.updatePiece);

// Supprimer une pièce spécifique par son ID
router.delete('/:id', auth, pieceController.deletePiece);

// Voir les détails d'une pièce et ses appareils (Populate)
router.get('/:id', auth, pieceController.getPieceDetails);

module.exports = router;