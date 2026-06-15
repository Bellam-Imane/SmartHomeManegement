const express = require('express');
const router = express.Router();

const appareilController = require('../controllers/appareilController');
const sceneController = require('../controllers/sceneController');
const ruleController = require('../controllers/ruleController');

// Importation du middleware d'authentification pour sécuriser les données par compte
const authMiddleware = require('../middleware/authMiddleware'); 

// ── APPAREILS ──
// Correctif : Ajout du authMiddleware pour filtrer les appareils et les pièces de l'utilisateur connecté
router.get('/appareils', authMiddleware, appareilController.getAllAppareils);

// ── SCENES ──
router.get('/scenes', authMiddleware, sceneController.getAllScenes);
router.post('/scenes', authMiddleware, sceneController.createScene);
// 💡 Route PUT pour la modification complète d'une scène spécifique (Sauvegarde d'état)
router.put('/scenes/:id', authMiddleware, sceneController.updateScene);
// 🗑️ Route DELETE pour supprimer une scène
router.delete('/scenes/:id', authMiddleware, sceneController.deleteScene);
// ▶️ Route POST pour exécuter une scène (envoyer toutes les commandes MQTT)
router.post('/scenes/:id/execute', authMiddleware, sceneController.executeScene);

// ── RULES ──
router.get('/rules', authMiddleware, ruleController.getAllRules);
router.post('/rules', authMiddleware, ruleController.createRule);
// 💡 Route PUT pour la modification complète d'une règle spécifique (Sauvegarde d'état)
router.put('/rules/:id', authMiddleware, ruleController.updateRule);
// 🗑️ Route DELETE pour supprimer une règle
router.delete('/rules/:id', authMiddleware, ruleController.deleteRule);
// 🔀 Route PATCH pour basculer l'état d'activation d'une règle
router.patch('/rules/:id/toggle', authMiddleware, ruleController.toggleRule);

module.exports = router;