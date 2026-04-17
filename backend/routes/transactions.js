const { addExpense, getExpense, updateExpense, deleteExpense } = require('../controllers/expense');
const { addIncome, getIncomes, updateIncome, deleteIncome } = require('../controllers/income');
const { fetchTransactions } = require('../controllers/transactionController');
const router = require('express').Router();
const verifyToken = require("../middleware/verifyToken");

router.use(verifyToken);

router
    .post('/add-income', addIncome)
    .get('/get-incomes', getIncomes)
    .put('/update-income/:id', updateIncome)
    .delete('/delete-income/:id', deleteIncome)
    .post('/add-expense', addExpense)
    .get('/get-expenses', getExpense)
    .put('/update-expense/:id', updateExpense)
    .delete('/delete-expense/:id', deleteExpense)
    .get("/get-user-transactions/:userId", fetchTransactions);

module.exports = router;