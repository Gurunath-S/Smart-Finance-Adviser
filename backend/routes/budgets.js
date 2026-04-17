const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const ExpenseSchema = require('../models/ExpenseModel');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

// GET all budgets for current user (optionally filtered by month)
router.get('/', async (req, res) => {
    const { month } = req.query; // e.g. "2026-02"
    const query = { userId: req.userId };
    if (month) query.month = month;

    try {
        const budgets = await Budget.find(query).lean();

        // For each budget, compute how much was spent in that category/month
        const enriched = await Promise.all(budgets.map(async (b) => {
            const [yearStr, monthStr] = b.month.split('-');
            const start = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
            const end = new Date(parseInt(yearStr), parseInt(monthStr), 1);

            const result = await ExpenseSchema.aggregate([
                { $match: { userId: req.userId, category: b.category, date: { $gte: start, $lt: end } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const spent = result[0]?.total || 0;
            return { ...b, spent };
        }));

        res.status(200).json(enriched);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// POST create or update a budget
router.post('/', async (req, res) => {
    const { category, limit, month } = req.body;
    if (!category || !limit || !month) {
        return res.status(400).json({ message: 'category, limit, and month are required' });
    }

    try {
        const budget = await Budget.findOneAndUpdate(
            { userId: req.userId, category, month },
            { limit },
            { upsert: true, new: true }
        );
        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// DELETE a budget
router.delete('/:id', async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        if (budget.userId !== req.userId) return res.status(403).json({ message: 'Access denied' });

        await Budget.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
