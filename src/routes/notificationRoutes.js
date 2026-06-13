const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// GET /api/notifications — paginated list with filters
router.get('/', authMiddleware, notificationController.getAllNotifications);

// GET /api/notifications/unread-count — badge count
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', authMiddleware, notificationController.markAllAsRead);

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// DELETE /api/notifications/:id — delete one
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

// DELETE /api/notifications — delete all
router.delete('/', authMiddleware, notificationController.deleteAll);

module.exports = router;
