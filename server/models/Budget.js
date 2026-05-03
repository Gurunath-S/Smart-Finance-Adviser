const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true },
    month: { type: String, required: true }, // format: "YYYY-MM"
}, { timestamps: true });

// One budget per category per user per month
BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
