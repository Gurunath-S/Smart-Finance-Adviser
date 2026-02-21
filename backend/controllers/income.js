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
    try {
        // .lean() returns plain JS objects (much faster than full Mongoose docs)
        // Sort on DB side so client doesn't have to
        const income = await IncomeSchema
            .find({ userId })
            .sort({ date: -1 })
            .lean();
        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const income = await IncomeSchema.findById(id).lean();
        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }
        if (income.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only delete your own income' });
        }

        await IncomeSchema.findByIdAndDelete(id);
        res.status(200).json({ message: 'Income Deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
