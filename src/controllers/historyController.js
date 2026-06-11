/**
 * historyController.js
 * Controller for Phase 4 - Step 2: History Query Endpoints.
 * Reads historical data from PostgreSQL tables.
 */
const {
  getDeviceHistory,
  getSecurityNotifications,
  markNotificationRead,
  getAutomationLogs
} = require('../services/historyService');

/**
 * @desc    Fetch device state-change history
 * @route   GET /api/history/devices
 * @query   ?deviceId=&typeEvenement=&limit=&dateFrom=&dateTo=
 * @access  Private
 */
exports.getDeviceHistory = async (req, res) => {
  try {
    const { deviceId, typeEvenement, limit, dateFrom, dateTo } = req.query;
    const rows = await getDeviceHistory({
      deviceId,
      typeEvenement,
      limit: limit ? parseInt(limit) : 50,
      dateFrom,
      dateTo
    });
    res.status(200).json({ count: rows.length, data: rows });
  } catch (error) {
    console.error("[historyController] getDeviceHistory error:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération de l'historique des appareils", error: error.message });
  }
};

/**
 * @desc    Fetch security notifications
 * @route   GET /api/history/security
 * @query   ?unreadOnly=true&limit=&dateFrom=&dateTo=
 * @access  Private
 */
exports.getSecurityNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit, dateFrom, dateTo } = req.query;
    const userId = req.user.id;
    const rows = await getSecurityNotifications({
      userId,
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 50,
      dateFrom,
      dateTo
    });
    res.status(200).json({ count: rows.length, data: rows });
  } catch (error) {
    console.error("[historyController] getSecurityNotifications error:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des notifications", error: error.message });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/history/security/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await markNotificationRead(parseInt(id));
    if (!updated) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }
    res.status(200).json({ message: "Notification marquée comme lue" });
  } catch (error) {
    console.error("[historyController] markAsRead error:", error.message);
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

/**
 * @desc    Fetch automation rule logs
 * @route   GET /api/history/automation
 * @query   ?statut=&limit=&dateFrom=&dateTo=
 * @access  Private
 */
exports.getAutomationLogs = async (req, res) => {
  try {
    const { statut, limit, dateFrom, dateTo } = req.query;
    const rows = await getAutomationLogs({
      statut,
      limit: limit ? parseInt(limit) : 50,
      dateFrom,
      dateTo
    });
    res.status(200).json({ count: rows.length, data: rows });
  } catch (error) {
    console.error("[historyController] getAutomationLogs error:", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des logs d'automatisation", error: error.message });
  }
};
