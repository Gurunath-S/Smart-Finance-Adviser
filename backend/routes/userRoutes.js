const express = require("express");
const User = require("../models/User");
const ExpenseSchema = require("../models/ExpenseModel");
const IncomeSchema = require("../models/IncomeModel");
const Transaction = require("../models/Transaction");
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
const upload = multer({ storage: storage });

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
    
    // Cascade delete related incomes, expenses, and suggestions
    await Promise.all([
      IncomeSchema.deleteMany({ userId: user._id.toString() }),
      ExpenseSchema.deleteMany({ userId: user._id.toString() }),
      Suggestion.deleteMany({ userId: user._id.toString() })
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
      ExpenseSchema.find({ userId }).sort({ date: -1 }).lean(),
      IncomeSchema.find({ userId }).sort({ date: -1 }).lean()
    ]);

    return res.status(200).json({ expenses, incomes });
  } catch (error) {
    console.error("Error Fetching Financial Data:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
