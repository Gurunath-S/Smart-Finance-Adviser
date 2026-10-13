const ExpenseSchema = require("../models/ExpenseModel");
const { parseMonetaryAmount } = require("../utils/currency");

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date, paymentMode, excludeFromTotal, omittedAmount } = req.body;
    const userId = req.userId;

    const { valid, amount: parsedAmount, error } = parseMonetaryAmount(amount);
    if (!valid) {
        return res.status(400).json({ message: error || 'Amount must be a positive number!' });
    }
    if (!title || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const expense = new ExpenseSchema({
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
        await expense.save();
        res.status(200).json({ message: 'Expense Added', expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getExpense = async (req, res) => {
    const userId = req.userId;
    try {
        // .lean() returns plain JS objects (much faster than full Mongoose docs)
        // Sort on DB side so client doesn't have to
        const expense = await ExpenseSchema
            .find({ userId })
            .sort({ date: -1 })
            .lean();
        res.status(200).json(expense);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const expense = await ExpenseSchema.findById(id).lean();
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (expense.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only delete your own expense' });
        }

        await ExpenseSchema.findByIdAndDelete(id);
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
