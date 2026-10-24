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

// Compound indexes for optimal query coverage (ESR: Equality -> Sort -> Range)
IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, paymentMode: 1, date: -1 });
IncomeSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Income', IncomeSchema);

