const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');   


router.get('/', verifyToken, (req, res) => {
    res.json({ 
        message: "Liste des utilisateurs récupérée avec succès !",
        userConnected: req.user  
    });
});

module.exports = router;