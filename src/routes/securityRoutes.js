const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // كنعيطو لكود صاحبتك كيف ما هو
const securityController = require('../controllers/securityController');

// حماية المسارات باستعمال الـ Middleware ديال صاحبتك
router.get('/alarm', verifyToken, securityController.getAlarmStatus);
router.put('/alarm', verifyToken, securityController.updateAlarmStatus);
router.get('/doors', verifyToken, securityController.getAllDoors);
router.put('/doors/:id/lock', verifyToken, securityController.toggleDoorLock);
router.get('/sensors', verifyToken, securityController.getAllSensors);
router.get('/cameras', verifyToken, securityController.getAllCameras);

module.exports = router;