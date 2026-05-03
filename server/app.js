const express = require('express')
const path = require('path')
const cors = require('cors');
const { db } = require('./db/db');
const app = express()
const authRoutes = require('./routes/auth')
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/userRoutes");
const budgetRoutes = require("./routes/budgets");
require('dotenv').config()

const PORT = process.env.PORT || 5000;

app.use(express.json())
app.use(cors())
// Serve uploaded avatar images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1", suggestionsRoute);
app.use("/api/v1", transactionRoutes);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api", emailRoutes);

const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server()