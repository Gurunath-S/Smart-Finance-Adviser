const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: "income"
    },
    date: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 500,  // Sensible limit — was 200,000,000
        trim: true
    },
    userId: {
        type: String,
        required: true,
        index: true  // Index for fast user-based queries
    }
}, { timestamps: true });

module.exports = mongoose.model('Income', IncomeSchema);
