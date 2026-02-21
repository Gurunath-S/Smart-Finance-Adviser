const express = require('express')
const cors = require('cors');
const { db } = require('./db/db');
const app = express()
const authRoutes = require('./routes/auth')
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/userRoutes");
require('dotenv').config()

const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json())
app.use(cors())

//routes
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1", suggestionsRoute);
app.use("/api", emailRoutes);
app.use('/api/v1', transactionRoutes);

const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server()