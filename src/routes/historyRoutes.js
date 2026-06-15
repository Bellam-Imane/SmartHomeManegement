/**
 * historyRoutes.js
 * Phase 4 - Step 2: History Query Endpoints for PostgreSQL data.
 */
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getDeviceHistory,
  getSecurityNotifications,
  markAsRead,
  getAutomationLogs
} = require('../controllers/historyController');

// All history routes require authentication
router.use(verifyToken);

// GET /api/history/devices - Device state-change history
router.get('/devices', getDeviceHistory);

// GET /api/history/security - Security notifications for current user
router.get('/security', getSecurityNotifications);

// PUT /api/history/security/:id/read - Mark a notification as read
router.put('/security/:id/read', markAsRead);

// GET /api/history/automation - Automation rule execution logs
router.get('/automation', getAutomationLogs);

module.exports = router;
