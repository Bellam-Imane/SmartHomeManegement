/**
 * dashboardRoutes.js
 * Dashboard API routes — summary and energy chart endpoints.
 */
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const dashboardCtrl = require('../controllers/dashboardController');

// All dashboard routes require authentication
router.use(verifyToken);

// GET /api/dashboard/summary — Live sensor data, devices, stats
router.get('/summary', dashboardCtrl.getDashboardSummary);

// GET /api/dashboard/energy?range=-7d&window=1d — Energy chart aggregated data
router.get('/energy', dashboardCtrl.getEnergyChart);

module.exports = router;
