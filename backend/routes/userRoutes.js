const express = require("express");
const User = require("../models/User");
const ExpenseSchema = require("../models/ExpenseModel");
const IncomeSchema = require("../models/IncomeModel");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const Suggestion = require("../models/Suggestion");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "smart-finance-adviser",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB maximum file size limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, and PNG images are allowed.'));
    }
  }
});

// PUT update profile image (User self-service)
router.put('/update-profile-image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    // Create the public URL path
    const imageUrl = req.file.path;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ 
      message: "Profile image updated successfully", 
      profileImage: updatedUser.profileImage 
    });
  } catch (error) {
    console.error("Error updating profile image", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET current user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

// PUT update user profile (username, email)
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username.trim() !== "") {
      const trimmedUsername = username.trim();
      if (trimmedUsername !== user.username) {
        const existingUsername = await User.findOne({ username: trimmedUsername });
        if (existingUsername) {
          return res.status(400).json({ message: "Username is already taken" });
        }
        user.username = trimmedUsername;
      }
    }

    if (email && email.trim() !== "") {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
          return res.status(400).json({ message: "Email is already registered" });
        }
        user.email = normalizedEmail;
      }
    }

    await user.save();
    const { password: _, ...safeUser } = user.toObject();
    res.status(200).json({ message: "Profile updated successfully", user: safeUser });
  } catch (error) {
    console.error("Error updating user profile", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// PUT change user password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ 
        message: "This account uses Google Sign-In and does not have a local password." 
      });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password", error);
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
});

// GET all users (Admin only)
router.get("/get-users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Never return passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// POST add a new user (Admin only)
router.post("/add-users", verifyToken, verifyAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email or username" });
    }

    const newUser = new User({ 
      username, 
      email: email.toLowerCase(), 
      password,
      role: role === 'admin' ? 'admin' : 'user'
    });
    await newUser.save();
    const { password: _, ...safeUser } = newUser.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to add user", error: err.message });
  }
});

// DELETE a user (Admin only)
router.delete("/delete-users/:id", verifyToken, verifyAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Cascade delete related incomes, expenses, and suggestions across both _id and custom userId
    const idTargets = [user._id.toString()];
    if (user.userId && user.userId !== user._id.toString()) {
      idTargets.push(user.userId);
    }

    await Promise.all([
      IncomeSchema.deleteMany({ userId: { $in: idTargets } }),
      ExpenseSchema.deleteMany({ userId: { $in: idTargets } }),
      Suggestion.deleteMany({ userId: { $in: idTargets } })
    ]);

    res.status(200).json({ message: "User and associated data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// GET transactions for a specific user (Admin only)
router.get('/get-user-transactions/:userId', verifyToken, verifyAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const [expenses, incomes] = await Promise.all([
      ExpenseSchema.find({ userId }).sort({ date: -1 }).select('-__v').lean(),
      IncomeSchema.find({ userId }).sort({ date: -1 }).select('-__v').lean()
    ]);

    return res.status(200).json({ expenses, incomes });
  } catch (error) {
    console.error("Error Fetching Financial Data:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

// GET current user's cash denominations (notes & coins)
router.get('/cash-denominations', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('cashDenominations').lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const defaultDenominations = {
      notes: { n500: 0, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0 },
      coins: { c20: 0, c10: 0, c5: 0, c2: 0, c1: 0 }
    };

    const denominations = user.cashDenominations || defaultDenominations;
    const notes = { ...defaultDenominations.notes, ...(denominations.notes || {}) };
    const coins = { ...defaultDenominations.coins, ...(denominations.coins || {}) };

    const totalNotes =
      (notes.n500 || 0) * 500 +
      (notes.n200 || 0) * 200 +
      (notes.n100 || 0) * 100 +
      (notes.n50 || 0) * 50 +
      (notes.n20 || 0) * 20 +
      (notes.n10 || 0) * 10;

    const totalCoins =
      (coins.c20 || 0) * 20 +
      (coins.c10 || 0) * 10 +
      (coins.c5 || 0) * 5 +
      (coins.c2 || 0) * 2 +
      (coins.c1 || 0) * 1;

    const totalInHandCash = totalNotes + totalCoins;
    const omittedAmount = denominations.omittedAmount || 0;
    const isOmittedActive = denominations.isOmittedActive !== undefined ? Boolean(denominations.isOmittedActive) : (omittedAmount > 0);
    const effectiveInHandCash = isOmittedActive ? Math.max(0, totalInHandCash - omittedAmount) : totalInHandCash;

    res.status(200).json({
      denominations: { notes, coins, omittedAmount, isOmittedActive },
      totalNotes,
      totalCoins,
      totalInHandCash,
      omittedAmount,
      isOmittedActive,
      effectiveInHandCash
    });
  } catch (err) {
    console.error("Error fetching cash denominations:", err);
    res.status(500).json({ message: "Failed to fetch cash denominations", error: err.message });
  }
});

// PUT update current user's cash denominations (notes & coins)
router.put('/cash-denominations', verifyToken, async (req, res) => {
  try {
    const { notes = {}, coins = {}, omittedAmount = 0, isOmittedActive } = req.body;

    const cleanNotes = {
      n500: Math.max(0, parseInt(notes.n500, 10) || 0),
      n200: Math.max(0, parseInt(notes.n200, 10) || 0),
      n100: Math.max(0, parseInt(notes.n100, 10) || 0),
      n50: Math.max(0, parseInt(notes.n50, 10) || 0),
      n20: Math.max(0, parseInt(notes.n20, 10) || 0),
      n10: Math.max(0, parseInt(notes.n10, 10) || 0),
    };

    const cleanCoins = {
      c20: Math.max(0, parseInt(coins.c20, 10) || 0),
      c10: Math.max(0, parseInt(coins.c10, 10) || 0),
      c5: Math.max(0, parseInt(coins.c5, 10) || 0),
      c2: Math.max(0, parseInt(coins.c2, 10) || 0),
      c1: Math.max(0, parseInt(coins.c1, 10) || 0),
    };

    const cleanOmitted = Math.max(0, parseInt(omittedAmount, 10) || 0);
    const cleanIsOmittedActive = isOmittedActive !== undefined ? Boolean(isOmittedActive) : (cleanOmitted > 0);

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        cashDenominations: {
          notes: cleanNotes,
          coins: cleanCoins,
          omittedAmount: cleanOmitted,
          isOmittedActive: cleanIsOmittedActive,
        }
      },
      { new: true }
    ).select('cashDenominations').lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalNotes =
      cleanNotes.n500 * 500 +
      cleanNotes.n200 * 200 +
      cleanNotes.n100 * 100 +
      cleanNotes.n50 * 50 +
      cleanNotes.n20 * 20 +
      cleanNotes.n10 * 10;

    const totalCoins =
      cleanCoins.c20 * 20 +
      cleanCoins.c10 * 10 +
      cleanCoins.c5 * 5 +
      cleanCoins.c2 * 2 +
      cleanCoins.c1 * 1;

    const totalInHandCash = totalNotes + totalCoins;
    const effectiveInHandCash = cleanIsOmittedActive ? Math.max(0, totalInHandCash - cleanOmitted) : totalInHandCash;

    res.status(200).json({
      message: "Cash denominations updated successfully",
      denominations: user.cashDenominations,
      totalNotes,
      totalCoins,
      totalInHandCash,
      omittedAmount: cleanOmitted,
      isOmittedActive: cleanIsOmittedActive,
      effectiveInHandCash
    });
  } catch (err) {
    console.error("Error updating cash denominations:", err);
    res.status(500).json({ message: "Failed to update cash denominations", error: err.message });
  }
});

module.exports = router;
