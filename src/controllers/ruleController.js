const Rule = require('../models/Regle');

// GET all rules
const getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find();
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE rule
const createRule = async (req, res) => {
  try {
    const newRule = new Rule(req.body);
    const saved = await newRule.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRules,
  createRule
};