const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
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

// Explicitly allowed client origins
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
    // Allow non-browser requests (native mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isDev = process.env.NODE_ENV !== 'production';

    if (isExplicitlyAllowed || isDev) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Middlewares: Security headers, compression, body parsing, cookies, and CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// health checks for Render & browsers
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Finance Adviser API is running smoothly', time: new Date().toISOString() });
});

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