const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController');

// Route 
router.get('/status', (req, res) => res.json({ message: "successfully connected" }));

// Routes ghizlane
router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);

// Routes riham
// Fix for password reset flow completed
router.post('/forgot-passwords', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router
