const IncomeSchema = require("../models/IncomeModel");
const ExpenseSchema = require("../models/ExpenseModel");

exports.fetchTransactions = async (req, res) => {
    const { userId } = req.params;

    if (req.userId !== userId) {
        return res.status(403).json({ message: "Access denied: you can only view your own transactions." });
    }

    try {
        // Parallel fetch — both run at the same time instead of sequentially
        // .lean() returns plain objects which are much faster to serialize
        const [expenses, incomes] = await Promise.all([
            ExpenseSchema.find({ userId }).sort({ date: -1 }).lean(),
            IncomeSchema.find({ userId }).sort({ date: -1 }).lean()
        ]);

        return res.status(200).json({ expenses, incomes });
    } catch (error) {
        console.error("Error Fetching Financial Data:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
