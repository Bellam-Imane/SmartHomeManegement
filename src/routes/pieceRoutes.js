const express = require('express');
const router = express.Router();
const pieceController = require('../controllers/pieceController');
const auth = require('../middleware/authMiddleware');

// --- Routes pour la gestion des pièces ---

// Route pour récupérer les pièces de l'utilisateur connecté
router.get('/all', auth, pieceController.getPieces); 

// Route pour ajouter une piece 
router.post('/ajouter', auth, pieceController.ajouterPiece); 

// Modifier une pièce spécifique par son ID
router.put('/:id', auth, pieceController.updatePiece);

// Supprimer une pièce spécifique par son ID
router.delete('/:id', auth, pieceController.deletePiece);

// Voir les détails d'une pièce et ses appareils (Populate)
router.get('/:id', auth, pieceController.getPieceDetails);

module.exports = router;