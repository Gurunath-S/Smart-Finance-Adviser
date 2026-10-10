const express = require('express')
const cors = require('cors');
const { db } = require('./db/db');
const cookieParser = require('cookie-parser');
const app = express();
// Enable trust proxy for accurate client IP identification behind reverse proxies
app.set('trust proxy', 1);
const authRoutes = require('./routes/auth');
const suggestionsRoute = require("./routes/suggestions");
const emailRoutes = require("./routes/emailRoutes");
const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/userRoutes");
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Allow local dev origins + Vercel origins + custom CLIENT_URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:19006',
  'http://localhost:8081',
  'https://smart-finance-adviser.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    let hostname = '';
    try {
      hostname = new URL(origin).hostname;
    } catch (_e) {
      hostname = '';
    }

    const isVercel = hostname.endsWith('.vercel.app') || hostname === 'vercel.app';
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isDev = process.env.NODE_ENV !== 'production';

    if (isExplicitlyAllowed || isVercel || isDev) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

//middlewares
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

//routes
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1", suggestionsRoute);
app.use("/api", emailRoutes);
app.use('/api/v1', transactionRoutes);

// global error handler to catch multer/cloudinary crashes and return JSON
app.use((err, req, res, _next) => {
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