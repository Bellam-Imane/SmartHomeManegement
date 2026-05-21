const express = require('express');
const router = express.Router();
const dashboardCtrl = require('../controllers/dashboardController');

// Route pour obtenir le résumé complet du dashboard
router.get('/summary', dashboardCtrl.getDashboardSummary);

module.exports = router;