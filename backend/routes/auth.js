const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleServerError } = require('../utils/errorHandler');
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    // Create user (password hashing is handled in UserSchema.pre('save'))
    const user = new User({ username, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      user: { username: user.username, email: user.email, userId: user.userId },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error signing up");
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      user: { username: user.username, email: user.email, userId: user.userId },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error logging in");
  }
});

module.exports = router;
