const express = require('express');
const router = express.Router();
const appareilController = require('../controllers/appareilController');

// Route PUT pour modifier un appareil spécifique via son ID
router.put('/:id', appareilController.updateAppareil);

module.exports = router;