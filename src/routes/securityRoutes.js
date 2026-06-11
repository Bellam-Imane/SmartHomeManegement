const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const securityController = require('../controllers/securityController');

// Les nouvelles voies du tableau de bord pour que nous puissions répondre et changer la situation en matière de sécurité
router.get('/', verifyToken, securityController.getSecurityStatus);
router.put('/', verifyToken, securityController.updateSecurityStatus);

//C’est ton ancienne façon d’envoyer des e-mails (laissons tomber !)
router.post('/trigger-alert', verifyToken, securityController.triggerSecurityAlert);

module.exports = router;