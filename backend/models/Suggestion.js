// models/Suggestion.js
const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
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
}, { timestamps: true });

module.exports = mongoose.model('Suggestion', SuggestionSchema);

