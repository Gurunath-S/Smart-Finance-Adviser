const IncomeSchema = require("../models/IncomeModel");
const { parseMonetaryAmount } = require("../utils/currency");

exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date, paymentMode, excludeFromTotal, omittedAmount } = req.body;
    const userId = req.userId;

    if (!title || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const { valid, amount: parsedAmount, error } = parseMonetaryAmount(amount);
    if (!valid) {
        return res.status(400).json({ message: error || 'Amount must be a positive number!' });
    }

    try {
        const income = new IncomeSchema({
            title,
            amount: parsedAmount,
            category,
            description,
            date,
            userId,
            paymentMode: paymentMode === 'cash' ? 'cash' : 'online',
            excludeFromTotal: Boolean(excludeFromTotal),
            omittedAmount: Math.max(0, Number(omittedAmount) || 0)
        });
        await income.save();
        res.status(200).json({ message: 'Income Added', income });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getIncomes = async (req, res) => {
    const userId = req.userId;
    try {
        // .lean() returns plain JS objects (much faster than full Mongoose docs)
        // Sort on DB side so client doesn't have to
        const income = await IncomeSchema
            .find({ userId })
            .sort({ date: -1 })
            .lean();
        res.status(200).json(income);
    } catch (error) {
        console.error("Error fetching incomes:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Atomic single-query deletion (halves latency and avoids race conditions)
        const deleted = await IncomeSchema.findOneAndDelete({ _id: id, userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Income not found or unauthorized' });
        }
        res.status(200).json({ message: 'Income Deleted' });
    } catch (error) {
        console.error('Error deleting income:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
