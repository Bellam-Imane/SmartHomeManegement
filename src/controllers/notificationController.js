const Notification = require('../models/Notifications');

/**
 * 📥 GET ALL NOTIFICATIONS — paginated, filterable
 * @route GET /api/notifications?categorie=&unreadOnly=true&limit=50&offset=0
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const { categorie, unreadOnly, limit = 50, offset = 0 } = req.query;
    const filter = { utilisateur: req.user.id };

    if (categorie && categorie !== 'ALL') {
      filter.categorie = categorie.toUpperCase();
    }
    if (unreadOnly === 'true') {
      filter.estLue = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ dateHeure: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit)),
      Notification.countDocuments(filter)
    ]);

    const unreadCount = await Notification.countDocuments({
      utilisateur: req.user.id,
      estLue: false
    });

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      unreadCount,
      count: notifications.length
    });
  } catch (error) {
    console.error("[notificationController] getAll error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔢 GET UNREAD COUNT
 * @route GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      utilisateur: req.user.id,
      estLue: false
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("[notificationController] unreadCount error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ MARK ONE AS READ
 * @route PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user.id },
      { estLue: true },
      { new: true }
    );
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable." });
    }

    // Notify Sidebar badge via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notifications_changed', { action: 'read_one' });
    }

    res.status(200).json({ success: true, data: notif });
  } catch (error) {
    console.error("[notificationController] markAsRead error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅✅ MARK ALL AS READ
 * @route PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { utilisateur: req.user.id, estLue: false },
      { estLue: true }
    );

    // Notify Sidebar badge via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notifications_changed', { action: 'read_all' });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s).`
    });
  } catch (error) {
    console.error("[notificationController] markAllAsRead error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🗑️ DELETE ONE
 * @route DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findOneAndDelete({
      _id: req.params.id,
      utilisateur: req.user.id
    });
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable." });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notifications_changed', { action: 'delete_one' });
    }

    res.status(200).json({ success: true, message: "Notification supprimée." });
  } catch (error) {
    console.error("[notificationController] delete error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🗑️🗑️ DELETE ALL
 * @route DELETE /api/notifications
 */
exports.deleteAll = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ utilisateur: req.user.id });

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('notifications_changed', { action: 'delete_all' });
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notification(s) supprimée(s).`
    });
  } catch (error) {
    console.error("[notificationController] deleteAll error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
