const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/init', deviceController.initializeDevices); // كديرها مرة وحدة فـ Postman باش تعمر الـ DB
router.get('/', deviceController.getDevices);
router.patch('/:name', deviceController.updateDevice);

module.exports = router;