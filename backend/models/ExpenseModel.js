const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
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
        default: "expense"
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
        maxLength: 500,  // Sensible limit — was 2,000,000,000
        trim: true
    },
    userId: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'online'],
        default: 'online'
    },
    excludeFromTotal: {
        type: Boolean,
        default: false
    },
    omittedAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index for efficient user filtering & date-descending sorting
ExpenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
