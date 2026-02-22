const IncomeSchema = require("../models/IncomeModel");

exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date } = req.body;
    const userId = req.userId;

    if (!title || !category || !description || !date) {
        return res.status(400).json({ message: 'All fields are required!' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number!' });
    }

    try {
        const income = new IncomeSchema({ title, amount: parsedAmount, category, description, date, userId });
        await income.save();
        res.status(200).json({ message: 'Income Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getIncomes = async (req, res) => {
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
        const [income, total] = await Promise.all([
            IncomeSchema.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)).lean(),
            IncomeSchema.countDocuments(query)
        ]);

        res.status(200).json({ data: income, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const { title, amount, category, description, date } = req.body;

    try {
        const income = await IncomeSchema.findById(id);
        if (!income) return res.status(404).json({ message: 'Income not found' });
        if (income.userId.toString() !== userId) return res.status(403).json({ message: 'Access denied' });

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        await IncomeSchema.findByIdAndUpdate(id, { title, amount: parsedAmount, category, description, date });
        res.status(200).json({ message: 'Income Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const income = await IncomeSchema.findById(id).lean();
        if (!income) return res.status(404).json({ message: 'Income not found' });
        if (income.userId.toString() !== userId) return res.status(403).json({ message: 'Access denied' });

        await IncomeSchema.findByIdAndDelete(id);
        res.status(200).json({ message: 'Income Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
