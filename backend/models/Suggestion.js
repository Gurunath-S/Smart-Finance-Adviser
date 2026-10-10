// models/Suggestion.js
const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
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

// Compound index for user history retrieval ordered by creation date
SuggestionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Suggestion', SuggestionSchema);

