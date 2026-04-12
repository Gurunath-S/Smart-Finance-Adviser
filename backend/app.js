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

const path = require('path');

//middlewares
app.use(express.json({ limit: '50mb' }))
app.use(cors())

//routes
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1", suggestionsRoute);
app.use("/api", emailRoutes);
app.use('/api/v1', transactionRoutes);

// global error handler to catch multer/cloudinary crashes and return JSON
app.use((err, req, res, next) => {
    console.error("Global Error Caught:", err.message);
    res.status(500).json({ message: err.message || "Internal Server Error" });
});

const server = () => {
    db()
    app.listen(PORT, () => {
        console.log('listening to port:', PORT)
    })
}

server()