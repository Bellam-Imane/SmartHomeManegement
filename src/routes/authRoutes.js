const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController');

// Route POST pour enregistrer un administrateur
router.post('/register-admin', authController.registerAdmin);

router.post('/login', authController.login);
module.exports = router; 