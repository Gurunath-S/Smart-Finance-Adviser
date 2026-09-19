const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { handleServerError } = require('../utils/errorHandler');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

const googleClient = new OAuth2Client();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

    res.cookie('token', token, COOKIE_OPTIONS);
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
    }).select('username email userId password profileImage role authProvider');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        message: 'This account was registered with Google Sign-In. Please use Continue with Google.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user: { username: user.username, email: user.email, userId: user.userId, profileImage: user.profileImage, role: user.role },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error logging in");
  }
});

// Google OAuth Login / Register route
router.post('/google', async (req, res) => {
  const idToken = req.body.credential || req.body.idToken || req.body.token;

  if (!idToken) {
    return res.status(400).json({ message: "Google ID token is required" });
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const mobileClientId = process.env.GOOGLE_MOBILE_CLIENT_ID;
    const validAudiences = [clientId, mobileClientId].filter(Boolean);

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: validAudiences.length > 0 ? validAudiences : undefined,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      return res.status(401).json({
        message: "Invalid or expired Google token",
        error: verifyError.message,
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Unable to retrieve email from Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase();

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    if (user) {
      // If user exists, link googleId or update avatar if missing
      let hasChanges = false;
      if (!user.googleId) {
        user.googleId = googleId;
        hasChanges = true;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        hasChanges = true;
      }
      if (hasChanges) {
        await user.save();
      }
    } else {
      // Create a unique username
      let baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase()
        .slice(0, 15);

      if (!baseUsername || baseUsername.length < 3) {
        baseUsername = `user_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      let uniqueUsername = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        suffix++;
        if (suffix > 10) {
          uniqueUsername = `${baseUsername}_${Date.now().toString().slice(-4)}`;
          break;
        }
      }

      user = new User({
        username: uniqueUsername,
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        profileImage: picture || '',
        role: 'user',
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        profileImage: user.profileImage,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    handleServerError(res, error, "Error authenticating with Google");
  }
});

// Current User Session verification (uses HttpOnly Cookie or Bearer Token)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email userId profileImage role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        userId: user.userId,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (error) {
    handleServerError(res, error, 'Error verifying user session');
  }
});

// Logout: clears session cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
