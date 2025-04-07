const express = require('express');
const router = express.Router();
const cohere = require('cohere-ai');
const Suggestion = require('../models/Suggestion'); // Ensure this path is correct
const moment = require('moment');
require('dotenv').config();
const { CohereClientV2 } = require('cohere-ai'); // Importing the new client

// Create a Cohere client instance with the API key
const cohereClient = new CohereClientV2({
  token: 'HZU46bkzJSlRc9R4snxdAuzIcrrCJWuE8H1ozQM2',  // Hardcode your API key here
});

// Generate suggestions using Cohere API
router.post('/get-suggestions', async (req, res) => {
  try {
    const { balance, income, expenses } = req.body;

    const prompt = `I have a balance of ${balance}, with a monthly income of ${income} and monthly expenses of ${expenses}.
Suggest a structured financial plan focusing only on the most suitable investment options from the following: SIP, SWP, Fixed Deposit, Mutual Funds, PPF, and Gold.
Evaluate which of these options best fit my financial status and goals, considering savings, income, and expenses. Provide clear monthly allocation suggestions and a brief conclusion. With only 3 points and with an conculsion  max 200 words`;

    // Calling Cohere's chat endpoint
    const response = await cohereClient.chat({
      model: 'command-a-03-2025', 
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log("Full Cohere API Response:", JSON.stringify(response, null, 2)); // Logging the full response object

    // Checking if the response contains the expected content
    const aiMessage = response?.message?.content?.[0]?.text;

    if (!aiMessage) {
      throw new Error("Failed to retrieve AI suggestions.");
    }

    const suggestionsArray = aiMessage.split("\n").map(item => item.trim()).filter(Boolean);

    res.status(200).json({
      balance,
      suggestions: suggestionsArray,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error.message);
    res.status(500).json({ message: "Internal Server Error." });
  }
});




// Save suggestions to the database
router.post('/saveSuggestions', async (req, res) => {
  try {
    const { suggestions, itemsUsedCount } = req.body;

    if (!suggestions || !Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Invalid suggestions data.' });
    }

    const newSuggestion = new Suggestion({
      suggestions,
      itemsUsedCount,
      date: moment().format('YYYY-MM-DD'), // Save the current date
    });

    await newSuggestion.save();

    res.status(200).json({ message: 'Suggestions saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error.' });
  }
});

module.exports = router;
