const express = require('express')
const cors = require('cors');
const { db } = require('./db/db');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/auth');
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/userRoutes");
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const path = require('path');

// Allow local dev origins + custom CLIENT_URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:19006',
  'http://localhost:8081',
  process.env.CLIENT_URL,
].filter(Boolean);

//middlewares
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

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