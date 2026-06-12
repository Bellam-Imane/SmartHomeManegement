const Scene = require('../models/Scene');

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

// Exportation des méthodes du controller
module.exports = {
  getAllScenes,
  createScene,
  updateScene // 💡 Ajout de la méthode PUT pour l'utilisation dans les routes des scènes
};