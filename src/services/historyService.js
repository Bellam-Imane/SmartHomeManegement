/**
 * historyService.js
 * Service for persisting house events into PostgreSQL (Phase 4).
 */
const { pgPool } = require('../config/db');

/**
 * Logs a device state change into the historique_donnees table.
 */
const logDeviceEvent = async (mongoDeviceId, typeEvenement, valeurAncienne, valeurNouvelle) => {
  try {
    const query = `
      INSERT INTO historique_donnees (mongo_device_id, type_evenement, valeur_ancienne, valeur_nouvelle)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [
      mongoDeviceId,
      typeEvenement,
      typeof valeurAncienne === 'object' ? JSON.stringify(valeurAncienne) : String(valeurAncienne),
      typeof valeurNouvelle === 'object' ? JSON.stringify(valeurNouvelle) : String(valeurNouvelle)
    ];
    await pgPool.query(query, values);
    console.log(`[PostgreSQL] Event logged: ${typeEvenement} | Device: ${mongoDeviceId}`);
  } catch (error) {
    console.error("[PostgreSQL] History write error:", error.message);
  }
};

/**
 * Logs a user notification into the notifications table.
 */
const logNotification = async (userId, titre, message) => {
  try {
    console.log(`[DEBUG] logNotification called -> userId: "${userId}" | type: ${typeof userId} | length: ${String(userId).length}`);
    const query = `
      INSERT INTO notifications (user_id, titre, message)
      VALUES ($1, $2, $3)
    `;
    await pgPool.query(query, [String(userId), titre, message]);
    console.log(`[PostgreSQL] Notification logged for user: ${userId}`);
  } catch (error) {
    console.error("[PostgreSQL] Notification write error:", error.message);
  }
};

/**
 * Logs an automation rule execution into the logs_automation table.
 */
const logAutomationRule = async (regleId, messageLog, statut = 'SUCCES') => {
  try {
    const query = `
      INSERT INTO logs_automation (regle_id, message_log, statut)
      VALUES ($1, $2, $3)
    `;
    await pgPool.query(query, [regleId, messageLog, statut]);
    console.log(`[PostgreSQL] Automation log recorded: ${messageLog}`);
  } catch (error) {
    console.error("[PostgreSQL] Automation log error:", error.message);
  }
};

// ==========================================
// READ FUNCTIONS (Phase 4 - Step 2)
// ==========================================

/**
 * Fetches device event history from historique_donnees.
 * Optional filters: deviceId, typeEvenement, limit, dateFrom, dateTo
 */
const getDeviceHistory = async ({ deviceId, typeEvenement, limit = 50, dateFrom, dateTo } = {}) => {
  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (deviceId) {
      conditions.push(`mongo_device_id = $${paramIndex++}`);
      params.push(deviceId);
    }
    if (typeEvenement) {
      conditions.push(`type_evenement = $${paramIndex++}`);
      params.push(typeEvenement);
    }
    if (dateFrom) {
      conditions.push(`date_evenement >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`date_evenement <= $${paramIndex++}`);
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    const query = `
      SELECT * FROM historique_donnees
      ${whereClause}
      ORDER BY date_evenement DESC
      LIMIT $${paramIndex}
    `;

    const result = await pgPool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[PostgreSQL] getDeviceHistory error:", error.message);
    throw error;
  }
};

/**
 * Fetches security notifications from the notifications table.
 * Optional filters: userId, unreadOnly, limit, dateFrom, dateTo
 */
const getSecurityNotifications = async ({ userId, unreadOnly = false, limit = 50, dateFrom, dateTo } = {}) => {
  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(String(userId));
    }
    if (unreadOnly) {
      conditions.push(`est_lu = false`);
    }
    if (dateFrom) {
      conditions.push(`date_notification >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`date_notification <= $${paramIndex++}`);
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    const query = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY date_notification DESC
      LIMIT $${paramIndex}
    `;

    const result = await pgPool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[PostgreSQL] getSecurityNotifications error:", error.message);
    throw error;
  }
};

/**
 * Marks a notification as read.
 */
const markNotificationRead = async (notificationId) => {
  try {
    const query = `UPDATE notifications SET est_lu = true WHERE id = $1`;
    const result = await pgPool.query(query, [notificationId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("[PostgreSQL] markNotificationRead error:", error.message);
    throw error;
  }
};

/**
 * Fetches automation rule logs from logs_automation.
 * Optional filters: statut, limit, dateFrom, dateTo
 */
const getAutomationLogs = async ({ statut, limit = 50, dateFrom, dateTo } = {}) => {
  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (statut) {
      conditions.push(`statut = $${paramIndex++}`);
      params.push(statut);
    }
    if (dateFrom) {
      conditions.push(`date_log >= $${paramIndex++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`date_log <= $${paramIndex++}`);
      params.push(dateTo);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);

    const query = `
      SELECT * FROM logs_automation
      ${whereClause}
      ORDER BY date_log DESC
      LIMIT $${paramIndex}
    `;

    const result = await pgPool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("[PostgreSQL] getAutomationLogs error:", error.message);
    throw error;
  }
};

module.exports = {
  // Write functions
  logDeviceEvent,
  logNotification,
  logAutomationRule,
  // Read functions
  getDeviceHistory,
  getSecurityNotifications,
  markNotificationRead,
  getAutomationLogs
};
