const Scene = require('../models/Scene');
const { Appareil } = require('../models/Appareil');
const { publishMessage } = require('../config/mqttService');

const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

/**
 * 📥 GET ALL SCENES
 * Récupération des scènes appartenant uniquement à l'utilisateur connecté
 */
const getAllScenes = async (req, res) => {
  try {
    const userConnectedId = req.user.id;
    const scenes = await Scene.find({ userId: userConnectedId });
    res.status(200).json(scenes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 💾 CREATE SCENE
 * Association automatique de la nouvelle scène à l'utilisateur connecté
 */
const createScene = async (req, res) => {
  try {
    const newScene = new Scene({
      ...req.body,
      userId: req.user.id // Sécurisation de la liaison utilisateur
    });
    const saved = await newScene.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔄 UPDATE SCENE (PUT METHOD)
 * Modification complète et globale d'une scène spécifique basée sur tout le req.body
 */
const updateScene = async (req, res) => {
  try {
    const { id } = req.params;

    // Mise à jour globale du document avec les nouvelles données reçues
    // Le filtre inclut userId pour s'assurer que l'utilisateur ne modifie que ses propres scènes
    const sceneModifiee = await Scene.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { ...req.body }, // Écrase et remplace par la nouvelle structure complète de la scène
      { new: true, runValidators: true } // Retourne la nouvelle version et force la validation du schéma
    );

    if (!sceneModifiee) {
      return res.status(404).json({ message: "Scène introuvable ou action non autorisée." });
    }

    res.status(200).json(sceneModifiee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🗑️ DELETE SCENE
 * Suppression sécurisée d'une scène appartenant à l'utilisateur connecté
 */
const deleteScene = async (req, res) => {
  try {
    const { id } = req.params;

    const sceneSupprimee = await Scene.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!sceneSupprimee) {
      return res.status(404).json({ message: "Scène introuvable ou action non autorisée." });
    }

    res.status(200).json({ success: true, message: "Scène supprimée avec succès." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ▶️ EXECUTE SCENE
 * Exécute toutes les actions d'une scène : met à jour MongoDB et envoie les commandes MQTT
 */
const executeScene = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Charger la scène et vérifier qu'elle appartient à l'utilisateur
    const scene = await Scene.findOne({ _id: id, userId: req.user.id });
    if (!scene) {
      return res.status(404).json({ message: "Scène introuvable ou action non autorisée." });
    }

    if (!scene.actions || scene.actions.length === 0) {
      return res.status(400).json({ message: "Cette scène ne contient aucune action." });
    }

    let executedActions = 0;

    // 2. Exécuter chaque action de la scène
    for (const action of scene.actions) {
      try {
        const appareil = await Appareil.findById(action.appareilId);
        if (!appareil) continue;

        const commande = action.commande?.toUpperCase();
        let updateData = {};

        // Mapper la commande vers le status MongoDB (supporte toutes les commandes)
        const CMD_ON = ['ON','PLAY','OPEN','START','MODE_CHAUD','MODE_FROID','MODE_AUTO','ACTIVER_ALARME','START_RECORD','UNLOCK','ACTIVER_DETECTION','MODE_TURBO','MODE_SILENCIEUX','INTENSITE_50','INTENSITE_100','COULEUR_ROUGE','COULEUR_BLEU','VOLUME_UP','VOLUME_DOWN','APP_NETFLIX','APP_YOUTUBE'];
        const CMD_OFF = ['OFF','PAUSE','CLOSE','STOP','DOCK','DESACTIVER_ALARME','STOP_RECORD','LOCK','DESACTIVER_DETECTION'];

        if (CMD_ON.includes(commande)) {
          updateData.status = 'ENLIGNE';
        } else if (CMD_OFF.includes(commande)) {
          updateData.status = 'HORSLIGNE';
        }

        // Mise à jour MongoDB
        if (Object.keys(updateData).length > 0) {
          await Appareil.findByIdAndUpdate(action.appareilId, { $set: updateData });
        }

        // Envoi de la commande MQTT
        const deviceTopic = `smart/home/appareil/${action.appareilId}`;
        publishMessage(deviceTopic, commande);

        // Également publier sur le topic central avec la vraie commande
        publishMessage(TOPIC_COMMANDES, JSON.stringify({
          deviceId: action.appareilId.toString(),
          action: commande,
          valeur: CMD_ON.includes(commande)
        }));

        executedActions++;
      } catch (actionErr) {
        console.warn(`[Scene Execute] Action échouée pour ${action.appareilId}:`, actionErr.message);
      }
    }

    // 3. Mettre à jour l'état de la scène
    scene.estActif = true;
    await scene.save();

    res.status(200).json({ 
      success: true, 
      message: `Scène "${scene.nomScene}" exécutée avec succès.`,
      executedActions 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exportation des méthodes du controller
module.exports = {
  getAllScenes,
  createScene,
  updateScene,
  deleteScene,
  executeScene
};