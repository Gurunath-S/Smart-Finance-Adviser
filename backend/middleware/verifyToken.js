const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly Cookie first (Web Client Session)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization Bearer Header (Mobile App / API Client)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(403).json({ message: 'Authorization token or session cookie is required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired session token' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required. Action forbidden.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin = verifyAdmin;

