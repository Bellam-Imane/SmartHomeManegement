const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

// verifyToken
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);

router.get('/membres', userController.getMembres);

module.exports = router;