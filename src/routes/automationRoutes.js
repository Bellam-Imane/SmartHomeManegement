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
// 💡 CORRECTIF : Route PUT pour la modification complète d'une scène spécifique (Sauvegarde d'état)
router.put('/scenes/:id', authMiddleware, sceneController.updateScene);

// ── RULES ──
router.get('/rules', authMiddleware, ruleController.getAllRules);
router.post('/rules', authMiddleware, ruleController.createRule);
// 💡 CORRECTIF : Route PUT pour la modification complète d'une règle spécifique (Sauvegarde d'état)
router.put('/rules/:id', authMiddleware, ruleController.updateRule);

module.exports = router;