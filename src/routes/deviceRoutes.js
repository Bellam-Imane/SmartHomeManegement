const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/init', deviceController.initializeDevices); 
router.get('/', deviceController.getDevices);
router.patch('/:name', deviceController.updateDevice);

module.exports = router;