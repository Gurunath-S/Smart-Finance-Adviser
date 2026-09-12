const express = require('express');
const router = express.Router();
const { CohereClientV2 } = require('cohere-ai');
const Suggestion = require('../models/Suggestion');
const verifyToken = require('../middleware/verifyToken');
require('dotenv').config();

// Create a Cohere client instance using the API key from environment variables
const cohereClient = new CohereClientV2({
  token: process.env.CO_API_KEY,
});

// Generate suggestions using Cohere API (protected)
router.post('/get-suggestions', verifyToken, async (req, res) => {
  try {
    const { balance = 0, income = 0, expenses = 0 } = req.body;

    const parsedBalance = Number(balance) || 0;
    const parsedIncome = Number(income) || 0;
    const parsedExpenses = Number(expenses) || 0;

    const prompt = `I have a balance of ${parsedBalance}, with a monthly income of ${parsedIncome} and monthly expenses of ${parsedExpenses}.
Suggest a structured financial plan focusing only on the most suitable investment options from the following: SIP, SWP, Fixed Deposit, Mutual Funds, PPF, and Gold.
Evaluate which of these options best fit my financial status and goals, considering savings, income, and expenses. Provide clear monthly allocation suggestions and a brief conclusion. With only 3 points and with a conclusion max 200 words.`;

    const response = await cohereClient.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const aiMessage = response?.message?.content?.[0]?.text;

    if (!aiMessage) {
      throw new Error("Failed to retrieve AI suggestions.");
    }

    const suggestionsArray = aiMessage.split("\n").map(item => item.trim()).filter(Boolean);

    res.status(200).json({
      balance: parsedBalance,
      suggestions: suggestionsArray,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error.message);
    res.status(500).json({ message: "Failed to generate suggestions. Please ensure AI key is active." });
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
