const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');
const verifyToken = require('../middleware/authMiddleware');

// --- Système d'alarme ---
router.get('/alarm', verifyToken, securityController.getAlarmStatus);
router.put('/alarm', verifyToken, securityController.updateAlarmStatus);

// --- Portes intelligentes ---
router.get('/doors', verifyToken, securityController.getAllDoors);
router.put('/doors/:id/lock', verifyToken, securityController.toggleDoorLock);

// --- Capteurs (mouvement, fumée, humidité) ---
router.get('/sensors', verifyToken, securityController.getAllSensors);

// --- Caméras ---
router.get('/cameras', verifyToken, securityController.getAllCameras);

module.exports = router;