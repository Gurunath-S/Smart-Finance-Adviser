const ExpenseSchema = require("../models/ExpenseModel");
const jwt = require('jsonwebtoken');

exports.addExpense = async (req, res) => {
    const { title, amount, category, description, date } = req.body;

    console.log('Received amount:', amount, 'Type:', typeof amount);

    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    if (!token) {
        return res.status(403).json({ message: 'Authorization token is required' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Corrected to decodedToken.id

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Create a new expense entry
        const expense = new ExpenseSchema({
            title,
            amount: parsedAmount,
            category,
            description,
            date,
            userId
        });

        await expense.save(); // Save the new expense entry
        res.status(200).json({ message: 'Expense Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getExpense = async (req, res) => {
    try {
        // Extract userId from the token (assuming it's in the Authorization header)
        const token = req.headers.authorization.split(' ')[1];  // Bearer token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Corrected to decodedToken.id

        // Fetch only the expense records associated with the logged-in user
        const expense = await ExpenseSchema.find({ userId });

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const expense = await ExpenseSchema.findById(id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: 'Authorization token is required' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Corrected to decodedToken.id

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
