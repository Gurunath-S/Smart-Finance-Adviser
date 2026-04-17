const ExpenseSchema = require("../models/ExpenseModel");

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;
    const userId = req.userId;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number!' });
    }
    if (!title || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const expense = new ExpenseSchema({ title, amount: parsedAmount, category, description, date, userId });
        await expense.save();
        res.status(200).json({ message: 'Expense Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getExpense = async (req, res) => {
    const userId = req.userId;
    const { page = 1, limit = 50, search = '', category = '', from = '', to = '' } = req.query;

    try {
        const query = { userId };
        if (category) query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [expense, total] = await Promise.all([
            ExpenseSchema.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)).lean(),
            ExpenseSchema.countDocuments(query)
        ]);

        res.status(200).json({ data: expense, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { title, amount, category, description, date } = req.body;

    try {
        const expense = await ExpenseSchema.findById(id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        if (expense.userId.toString() !== userId) return res.status(403).json({ message: 'Access denied' });

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        await ExpenseSchema.findByIdAndUpdate(id, { title, amount: parsedAmount, category, description, date });
        res.status(200).json({ message: 'Expense Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const expense = await ExpenseSchema.findById(id).lean();
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        if (expense.userId.toString() !== userId) return res.status(403).json({ message: 'Access denied' });

        await ExpenseSchema.findByIdAndDelete(id);
        res.status(200).json({ message: 'Expense Deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
