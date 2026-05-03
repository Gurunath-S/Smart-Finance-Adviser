const express = require('express');
const path = require('path');
const cors = require('cors');
const { db } = require('./db/db');
const errorMiddleware = require('./middleware/errorMiddleware');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/userRoutes");
const budgetRoutes = require("./routes/budgets");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded avatar images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suggestions', suggestionsRoute);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/email', emailRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: "Smart Finance Adviser API is running..." });
});

// Error handling
app.use(errorMiddleware);

const server = () => {
    db();
    app.listen(PORT, () => {
        console.log('Server is running on port:', PORT);
    });
};

server();