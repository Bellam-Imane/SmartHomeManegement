/**
 * userScope.js
 * ------------
 * Utility to scope MongoDB queries to the current user's Maison.
 * Uses the existing relationship chain: User → Maison → Piece → Appareil
 *
 * Exports:
 *   - getUserMaison(userId)     → returns the Maison document (or null)
 *   - getUserPieceIds(userId)   → returns array of Piece _id values
 *   - getAppareilFilter(userId) → returns the { piece: { $in: [...] } } filter object
 *   - getUserRoomIds(piece, maison) → returns Socket.IO room names for a given piece/maison
 */

const Maison = require('../models/Maison');
const Piece = require('../models/Piece');

/**
 * Find the Maison where the user is either proprietaire OR membre.
 */
async function getUserMaison(userId) {
    return await Maison.findOne({
        $or: [
            { proprietaire: userId },
            { membres: userId }
        ]
    });
}

/**
 * Return all Piece _id values belonging to the user's Maison.
 * Returns empty array if no Maison found.
 */
async function getUserPieceIds(userId) {
    const maison = await getUserMaison(userId);
    if (!maison) return [];

    const pieces = await Piece.find({ maison: maison._id }, '_id');
    return pieces.map(p => p._id);
}

/**
 * Build a MongoDB filter object that restricts Appareil queries
 * to only devices in the user's pieces.
 *
 * Usage:
 *   const filter = await getAppareilFilter(userId);
 *   Appareil.find(filter)...
 */
async function getAppareilFilter(userId) {
    const pieceIds = await getUserPieceIds(userId);
    if (pieceIds.length === 0) {
        // Return a filter that matches nothing (user has no maison)
        return { _id: { $exists: false } };
    }
    return { piece: { $in: pieceIds } };
}

/**
 * Given a piece _id, find which users have access to its maison.
 * Returns an array of user IDs (proprietaire + membres).
 * Used by MQTT/Socket.IO to emit to the correct rooms.
 */
async function getUsersForPiece(pieceId) {
    const piece = await Piece.findById(pieceId).select('maison');
    if (!piece) return [];

    const maison = await Maison.findById(piece.maison).select('proprietaire membres');
    if (!maison) return [];

    const userIds = [maison.proprietaire];
    if (maison.membres && maison.membres.length > 0) {
        userIds.push(...maison.membres);
    }
    // Return unique IDs as strings
    return [...new Set(userIds.map(id => id.toString()))];
}

/**
 * Generate Socket.IO room names for a list of user IDs.
 * Convention: room name = "user:{userId}"
 */
function userRoomNames(userIds) {
    return userIds.map(id => `user:${id}`);
}

module.exports = {
    getUserMaison,
    getUserPieceIds,
    getAppareilFilter,
    getUsersForPiece,
    userRoomNames
};
