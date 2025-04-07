const express = require("express");
const User = require("../models/User");
const router = express.Router();

// GET all users
router.get("/get-users", async (req, res) => {
  try {
    const users = await User.find({});
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
    res.status(201).json(newUser);
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
    // Optionally delete related transactions
    await Transaction.deleteMany({ userId: user._id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

router.get('/get-user-transactions/:userId', async (req, res) => {
  const { userId } = req.params;

  console.log("🔍 Received request for financial data for user:", userId);

  try {
      const [expenses, incomes] = await Promise.all([
          ExpenseSchema.find({ userId }),
          IncomeSchema.find({ userId })
      ]);

      console.log("📊 Expenses:", expenses);
      console.log("📈 Incomes:", incomes);

      return res.status(200).json({ expenses, incomes });
  } catch (error) {
      console.error("❌ Error Fetching Financial Data:", error);
      return res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
