const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Nous appelons le code de ton ami, comment est-il ?
const securityController = require('../controllers/securityController');

// Protéger les pistes avec le middleware de votre ami
router.get('/alarm', verifyToken, securityController.getAlarmStatus);
router.put('/alarm', verifyToken, securityController.updateAlarmStatus);
router.get('/doors', verifyToken, securityController.getAllDoors);
router.put('/doors/:id/lock', verifyToken, securityController.toggleDoorLock);
router.get('/sensors', verifyToken, securityController.getAllSensors);
router.get('/cameras', verifyToken, securityController.getAllCameras);

module.exports = router;