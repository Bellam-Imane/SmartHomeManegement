const express = require('express');
const router = express.Router();

const appareilController = require('../controllers/appareilController');
const sceneController = require('../controllers/sceneController');
const ruleController = require('../controllers/ruleController');

//appareils
router.get('/appareils', appareilController.getAllAppareils);

//scenes
router.get('/scenes', sceneController.getAllScenes);
router.post('/scenes', sceneController.createScene);

//rules
router.get('/rules', ruleController.getAllRules);
router.post('/rules', ruleController.createRule);

module.exports = router;