const IncomeSchema = require("../models/IncomeModel");
const ExpenseSchema = require("../models/ExpenseModel");
const User = require("../models/User");
const { buildTransactionFilter } = require("../utils/queryHelper");

// Unified Batch Overview: Returns incomes, expenses, and cash denominations in ONE round-trip
exports.fetchFinancialOverview = async (req, res) => {
    const userId = req.userId;

    try {
        const filter = buildTransactionFilter(userId, req.query);
        let expQuery = ExpenseSchema.find(filter).sort({ date: -1 });
        if (typeof expQuery.select === 'function') expQuery = expQuery.select('-__v');

        let incQuery = IncomeSchema.find(filter).sort({ date: -1 });
        if (typeof incQuery.select === 'function') incQuery = incQuery.select('-__v');

        const [expenses, incomes, user] = await Promise.all([
            expQuery.lean(),
            incQuery.lean(),
            User.findById(userId).select('cashDenominations').lean()
        ]);

        const defaultDenominations = {
            notes: { n500: 0, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0 },
            coins: { c20: 0, c10: 0, c5: 0, c2: 0, c1: 0 }
        };

        const denominations = user?.cashDenominations || defaultDenominations;
        const notes = { ...defaultDenominations.notes, ...(denominations.notes || {}) };
        const coins = { ...defaultDenominations.coins, ...(denominations.coins || {}) };

        const totalNotes =
            (notes.n500 || 0) * 500 +
            (notes.n200 || 0) * 200 +
            (notes.n100 || 0) * 100 +
            (notes.n50 || 0) * 50 +
            (notes.n20 || 0) * 20 +
            (notes.n10 || 0) * 10;

        const totalCoins =
            (coins.c20 || 0) * 20 +
            (coins.c10 || 0) * 10 +
            (coins.c5 || 0) * 5 +
            (coins.c2 || 0) * 2 +
            (coins.c1 || 0) * 1;

        const totalInHandCash = totalNotes + totalCoins;
        const omittedAmount = denominations.omittedAmount || 0;
        const isOmittedActive = denominations.isOmittedActive !== undefined
            ? Boolean(denominations.isOmittedActive)
            : (omittedAmount > 0);
        const effectiveInHandCash = isOmittedActive ? Math.max(0, totalInHandCash - omittedAmount) : totalInHandCash;

        const cashData = {
            denominations: { notes, coins, omittedAmount, isOmittedActive },
            totalNotes,
            totalCoins,
            totalInHandCash,
            omittedAmount,
            isOmittedActive,
            effectiveInHandCash
        };

        return res.status(200).json({ expenses, incomes, cashData });
    } catch (error) {
        console.error("Error fetching financial overview:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

exports.fetchTransactions = async (req, res) => {
    const targetUserId = (req.params.userId === 'me') ? req.userId : req.params.userId;

    if (req.userId !== targetUserId && req.userRole !== 'admin') {
        return res.status(403).json({ message: "Access denied: you can only view your own transactions." });
    }

    try {
        const filter = buildTransactionFilter(targetUserId, req.query);
        let expQuery = ExpenseSchema.find(filter).sort({ date: -1 });
        if (typeof expQuery.select === 'function') expQuery = expQuery.select('-__v');

        let incQuery = IncomeSchema.find(filter).sort({ date: -1 });
        if (typeof incQuery.select === 'function') incQuery = incQuery.select('-__v');

        const [expenses, incomes] = await Promise.all([
            expQuery.lean(),
            incQuery.lean()
        ]);

        return res.status(200).json({ expenses, incomes });
    } catch (error) {
        console.error("Error Fetching Financial Data:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
