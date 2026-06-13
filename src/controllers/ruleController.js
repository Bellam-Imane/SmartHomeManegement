const Rule = require('../models/Regle');

/**
 * 📥 GET ALL RULES
 * Récupération des règles appartenant uniquement à l'utilisateur connecté
 */
const getAllRules = async (req, res) => {
  try {
    const userConnectedId = req.user.id;
    const rules = await Rule.find({ userId: userConnectedId });
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 💾 CREATE RULE
 * Association automatique de la nouvelle règle à l'utilisateur connecté
 */
const createRule = async (req, res) => {
  try {
    const newRule = new Rule({
      ...req.body,
      userId: req.user.id // Sécurisation de la liaison utilisateur
    });
    const saved = await newRule.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * 🔄 UPDATE RULE (PUT METHOD)
 * Modification complète et globale d'une règle spécifique basée sur tout le req.body
 */
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;

    // Mise à jour globale du document avec les nouvelles données reçues
    // Le filtre inclut userId pour s'assurer que l'utilisateur ne modifie que ses propres règles
    const ruleModifiee = await Rule.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { ...req.body }, // Écrase et remplace par la nouvelle structure complète
      { new: true, runValidators: true } // Retourne la nouvelle version et force la validation du schéma
    );

    if (!ruleModifiee) {
      return res.status(404).json({ message: "Règle introuvable ou action non autorisée." });
    }

    res.status(200).json(ruleModifiee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exportation des méthodes du controller
module.exports = {
  getAllRules,
  createRule,
  updateRule // 💡 Ajout de la méthode PUT pour l'utilisation dans les routes
};