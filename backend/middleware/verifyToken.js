const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
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

