const express = require('express');
const router = express.Router();
const appareilController = require('../controllers/appareilController');
const verifyToken = require('../middleware/authMiddleware'); 


router.put('/:id', verifyToken, appareilController.updateAppareil);
router.post('/', verifyToken, appareilController.createAppareil);

module.exports = router;