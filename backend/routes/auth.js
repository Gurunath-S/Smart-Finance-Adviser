const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleServerError } = require('../utils/errorHandler');
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    // Create user (password hashing is handled in UserSchema.pre('save'))
    const user = new User({ username, email: email.toLowerCase(), password });
    await user.save();

    // Generate JWT token including role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      user: { username: user.username, email: user.email, userId: user.userId, profileImage: user.profileImage, role: user.role },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error signing up");
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Only select the fields we actually need — avoids loading unused data
    const user = await User.findOne({ 
      $or: [{ username }, { email: username.toLowerCase() }] 
    }).select('username email userId password profileImage role');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      user: { username: user.username, email: user.email, userId: user.userId, profileImage: user.profileImage, role: user.role },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error logging in");
  }
});

module.exports = router;
