const express = require("express");
const { sendMail } = require("../controllers/mailer");
const verifyToken = require("../middleware/verifyToken");
const { emailRateLimiter } = require("../middleware/rateLimiter");
const User = require("../models/User");
const router = express.Router();

// Protected & Rate-limited — only authenticated users can trigger emails
router.post("/send-email", verifyToken, emailRateLimiter, async (req, res) => {
  const { subject, text, html } = req.body;

  if (!subject || (!text && !html)) {
    return res.status(400).json({ message: "Subject and email body are required." });
  }

  try {
    const user = await User.findById(req.userId).select("email");
    if (!user || !user.email) {
      return res.status(404).json({ message: "User email not found." });
    }

    await sendMail(user.email, subject, text, html);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

module.exports = router;
