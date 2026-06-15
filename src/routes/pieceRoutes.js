const express = require('express');
const router = express.Router();

const pieceController = require('../controllers/pieceController');
const auth = require('../middleware/authMiddleware');


/**
 * -------------------------------------------------------------------
 * ROUTES DE GESTION DES PIÈCES
 * -------------------------------------------------------------------
 */


/**
 * [GET] Récupérer toutes les pièces de l'utilisateur connecté
 */
router.get('/all', auth, pieceController.getPieces);


/**
 * [GET] Récupérer les détails d'une pièce spécifique
 * ⚠️ Cette route doit rester avant PUT et DELETE pour éviter les conflits
 */
router.get('/:id', auth, pieceController.getPieceDetails);


/**
 * [POST] Ajouter une nouvelle pièce
 */
router.post('/ajouter', auth, pieceController.ajouterPiece);


/**
 * [PUT] Modifier une pièce par ID
 */
router.put('/:id', auth, pieceController.updatePiece);


/**
 * [DELETE] Supprimer une pièce par ID
 */
router.delete('/:id', auth, pieceController.deletePiece);


module.exports = router;