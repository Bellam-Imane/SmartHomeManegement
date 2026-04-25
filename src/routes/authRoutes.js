const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController');

// Route POST pour enregistrer un administrateur
router.post('/register-admin', authController.registerAdmin);

// Route pour vérifier la connexion
router.get('/status', (req, res) => res.json({ message: "successfully connected" }));

// Route pour mot de passe oublié (Riham's Task)
router.post('/forgot-passwords', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
module.exports = router;