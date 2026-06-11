/**
 * reportRoutes.js
 * Reports & Analytics API routes — single endpoint feeds the full Reports page.
 */
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const reportCtrl = require('../controllers/reportController');

// All report routes require authentication
router.use(verifyToken);

// GET /api/reports/summary — Full analytics: KPIs, charts, weekly stats, device breakdown
router.get('/summary', reportCtrl.getReportSummary);

module.exports = router;
