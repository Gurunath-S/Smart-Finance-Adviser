const express = require("express");
const path = require("path");
const multer = require("multer");
const User = require("../models/User");
const ExpenseSchema = require("../models/ExpenseModel");
const IncomeSchema = require("../models/IncomeModel");
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Multer setup — saves avatars to /uploads/avatars/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  }
});

router.use(verifyToken);

// GET current user info (including avatar)
router.get("/me", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email avatar').lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST upload avatar
router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
    res.status(200).json({ avatarUrl, message: "Avatar updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update avatar" });
  }
});

// PUT update own profile (any authenticated user)
router.put("/profile", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
      user.password = password;
    }
    await user.save();
    res.status(200).json({ message: "Profile updated", user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// GET all users
router.get("/get-users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Never return passwords
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// POST add a new user
router.post("/add-users", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    const { password: _, ...safeUser } = newUser.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to add user", error: err.message });
  }
});

// DELETE a user
router.delete("/delete-users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Delete related transactions
    await Transaction.deleteMany({ userId: user._id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// GET transactions for a specific user (admin view)
router.get('/get-user-transactions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [expenses, incomes] = await Promise.all([
      ExpenseSchema.find({ userId }),
      IncomeSchema.find({ userId })
    ]);

    return res.status(200).json({ expenses, incomes });
  } catch (error) {
    console.error("Error Fetching Financial Data:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
