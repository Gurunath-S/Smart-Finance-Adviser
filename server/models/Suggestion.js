// models/Suggestion.js
const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
    suggestions: {
        type: [String],
        required: true
    },
    itemsUsedCount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Suggestion', SuggestionSchema);
