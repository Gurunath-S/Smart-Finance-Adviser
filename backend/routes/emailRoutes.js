const express = require("express");
const { sendMail } = require("../controllers/mailer");
const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    await sendMail(to, subject, text, html);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

module.exports = router;
