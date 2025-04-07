const { addExpense, getExpense, deleteExpense } = require('../controllers/expense');
const { addIncome, getIncomes, deleteIncome } = require('../controllers/income');
const { fetchTransactions } = require('../controllers/transactionController');
const router = require('express').Router();
const verifyToken = require("../middleware/verifyToken");

console.log({ addExpense, getExpense, deleteExpense, addIncome, getIncomes, deleteIncome });

router.post('/add-income', addIncome)
    .get('/get-incomes', getIncomes)
    .delete('/delete-income/:id', deleteIncome)
    .post('/add-expense', addExpense)
    .get('/get-expenses', getExpense)
    .delete('/delete-expense/:id', deleteExpense)
    .get("/get-user-transactions/:userId", fetchTransactions);

    module.exports = router