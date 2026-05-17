const express = require('express');
const router = express.Router();
const appareilController = require('../controllers/appareilController');


const verifyToken = require('../middleware/authMiddleware'); 

// Route PUT pour modifier un appareil spécifique via son ID
router.put('/:id', verifyToken, appareilController.updateAppareil);

// Route POST pour créer et ajouter un nouvel appareil
router.post('/', verifyToken, appareilController.createAppareil);

module.exports = router;