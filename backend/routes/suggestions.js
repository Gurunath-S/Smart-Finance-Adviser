const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const verifyToken = require('../middleware/verifyToken');
const { getFinancialAdvice } = require('../services/advisoryEngine');
require('dotenv').config();

// Generate suggestions using Zero-Cost Advisory Engine (protected)
router.post('/get-suggestions', verifyToken, async (req, res) => {
  try {
    const { balance = 0, income = 0, expenses = 0 } = req.body;

    const advice = await getFinancialAdvice({ balance, income, expenses });

    res.status(200).json({
      balance: advice.balance,
      suggestions: advice.suggestions,
      provider: advice.provider || 'deterministic',
    });
  } catch (error) {
    console.error("Error generating suggestions:", error.message);
    res.status(500).json({ message: "Failed to generate suggestions." });
  }
});

// Save suggestions to the database (protected)
router.post('/saveSuggestions', verifyToken, async (req, res) => {
  try {
    const { suggestions, itemsUsedCount } = req.body;

    if (!suggestions || !Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Invalid suggestions data.' });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newSuggestion = new Suggestion({
      userId: req.userId,
      suggestions,
      itemsUsedCount: itemsUsedCount || suggestions.length,
      date: today,
    });

    await newSuggestion.save();

    res.status(200).json({ message: 'Suggestions saved successfully.' });
  } catch (error) {
    console.error("Error saving suggestions:", error.message);
    res.status(500).json({ error: 'Server Error.' });
  }
});

// Get user's saved suggestions history (protected)
router.get('/get-saved-suggestions', verifyToken, async (req, res) => {
  try {
    const history = await Suggestion.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    res.status(200).json(history);
  } catch (error) {
    console.error("Error retrieving suggestions history:", error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
