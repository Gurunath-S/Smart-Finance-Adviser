const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { handleServerError } = require('../utils/errorHandler');
const { sendMail } = require('../controllers/mailer');
const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    const user = new User({ username, email, password });
    await user.save();

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
    const user = await User.findOne({ username }).select('username email userId password');
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

// Forgot Password — sends reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email }).select('_id email username');
    // Always return success to avoid user enumeration
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}&userId=${user._id}`;

    await sendMail(
      user.email,
      'Smart Finance Adviser — Password Reset',
      `Hi ${user.username},\n\nClick the link below to reset your password (valid for 15 minutes):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
      `<p>Hi <strong>${user.username}</strong>,</p>
       <p>Click the link below to reset your password <em>(valid for 15 minutes)</em>:</p>
       <p><a href="${resetUrl}" style="background:#1a1a4e;color:#FFD700;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
       <p>If you didn't request this, ignore this email.</p>`
    );

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    handleServerError(res, error, 'Error sending reset email');
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, userId, newPassword } = req.body;
  if (!token || !userId || !newPassword) {
    return res.status(400).json({ message: 'token, userId, and newPassword are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordReset.findOne({ userId, token: hashedToken, expiresAt: { $gt: new Date() } });

    if (!resetRecord) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    await PasswordReset.deleteMany({ userId });

    res.status(200).json({ message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    handleServerError(res, error, 'Error resetting password');
  }
});

module.exports = router;
