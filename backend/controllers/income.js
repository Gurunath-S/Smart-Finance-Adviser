const IncomeSchema = require("../models/IncomeModel");
const jwt = require('jsonwebtoken');

exports.addIncome = async (req, res) => {
    const { title, amount, category, description, date } = req.body;
    
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];  // Bearer token
    if (!token) {
        return res.status(403).json({ message: 'Authorization token is required' });
    }

    try {
        // Decode the token and extract the user id from the token payload
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;  // Access 'id' from the token

        // Convert amount to a number explicitly
        const parsedAmount = parseFloat(amount);

        // Validation checks
        if (!title || !category || !description || !date) {
            return res.status(400).json({ message: 'All fields are required!' });
        }
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive number!' });
        }

        // Create the new income document with the userId
        const income = new IncomeSchema({
            title,
            amount: parsedAmount,
            category,
            description,
            date,
            userId
        });

        // Save the income to the database
        await income.save();
        res.status(200).json({ message: 'Income Added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


exports.getIncomes = async (req, res) => {
    try {
        // Extract userId from the token (assuming it's in the Authorization header)
        const token = req.headers.authorization.split(' ')[1];  // Bearer token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Correctly access 'id' from the decoded token

        // Fetch only the income records associated with the logged-in user
        const income = await IncomeSchema.find({ userId });

        res.status(200).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteIncome = async (req, res) => {
    const { id } = req.params;

    try {
        const income = await IncomeSchema.findById(id);
        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        const token = req.headers.authorization?.split(' ')[1];  // Bearer token
        if (!token) {
            return res.status(403).json({ message: 'Authorization token is required' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id; // Correctly access 'id' from the decoded token

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
