const Scene = require('../models/Scene');

// GET all scenes
const getAllScenes = async (req, res) => {
  try {
    const scenes = await Scene.find();
    res.status(200).json(scenes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE scene
const createScene = async (req, res) => {
  try {
    const newScene = new Scene(req.body);
    const saved = await newScene.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllScenes,
  createScene
};