const express = require('express');
const router = express.Router();
const pieceController = require('../controllers/pieceController');
const auth = require('../middleware/authMiddleware');

// --- Routes pour la gestion des pièces ---

// 1. [GET] Récupérer toutes les pièces de l'utilisateur connecté
router.get('/all', auth, pieceController.getPieces); 

// 2. [GET] Voir les détails d'une pièce spécifique (Celle-ci doit être avant PUT/DELETE)
router.get('/:id', auth, pieceController.getPieceDetails);

// 3. [POST] Ajouter une pièce 
router.post('/ajouter', auth, pieceController.ajouterPiece); 

// 4. [PUT] Modifier une pièce spécifique par son ID
router.put('/:id', auth, pieceController.updatePiece);

// 5. [DELETE] Supprimer une pièce spécifique par son ID
router.delete('/:id', auth, pieceController.deletePiece);

module.exports = router;