const IncomeSchema = require("../models/IncomeModel");
const ExpenseSchema = require("../models/ExpenseModel");

exports.fetchTransactions = async (req, res) => {
    const { userId } = req.params;

    console.log("🔍 Received request for financial data for user:", userId);

    try {
        const [expenses, incomes] = await Promise.all([
            ExpenseSchema.find({ userId }),
            IncomeSchema.find({ userId })
        ]);

        console.log("📊 Expenses:", expenses);
        console.log("📈 Incomes:", incomes);

        return res.status(200).json({ expenses, incomes });
    } catch (error) {
        console.error("❌ Error Fetching Financial Data:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
