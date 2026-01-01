// =============================================
// 1. Load Environment Variables
// =============================================
require("dotenv").config();

// =============================================
// 2. Imports
// =============================================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const Contact = require("./models/Contact");

// Email
const sendEmail = require("./email");

// =============================================
// 3. App Init
// =============================================
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// 4. Middleware
// =============================================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend/public")));

// =============================================
// 5. MongoDB
// =============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// =============================================
// 6. SMART FALLBACK CHATBOT (100% STABLE)
// =============================================
function smartFallback(message) {
  const text = message.toLowerCase();

  if (
    text.includes("mobile") ||
    text.includes("number") ||
    text.includes("whatsapp") ||
    text.includes("contact")
  ) {
    return "You can contact Arman on WhatsApp: +91-9416748873.";
  }

  if (
    text.includes("service") ||
    text.includes("services") ||
    text.includes("offer")
  ) {
    return "ARRAutomation provides QA Automation, Manual Testing, Cypress Automation, and HR Automation services.";
  }

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("charges")
  ) {
    return "Our pricing depends on project scope. Please contact us on WhatsApp for a quick quote.";
  }

  return "Thanks for your message 🙌 Our team will get back to you shortly.";
}

// =============================================
// 7. ROUTES
// =============================================

// ---------- Signup ----------
app.post("/api/signup", async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    if (!name || !mobile || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    await new User({ name, mobile, email, password }).save();
    res.json({ success: true, message: "Signup successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// ---------- Login ----------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    res.json({ success: true, message: "Login successful" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// ---------- Contact ----------
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false });
    }

    await new Contact(req.body).save();
    res.json({ success: true, message: "Message sent" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});

// ---------- Bug Formatter (Static for now) ----------
app.post("/api/format-bug", (req, res) => {
  const { note } = req.body;
  if (!note) {
    return res.status(400).json({ success: false });
  }

  const formatted = {
    title: "Bug Report",
    description: note,
    severity: "Medium",
    status: "Open"
  };

  res.json({ success: true, result: formatted });
});

// ---------- CHATBOT (MAIN – STABLE) ----------
app.post("/api/chatbot", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false });
  }

  const reply = smartFallback(message);
  res.json({ success: true, response: reply });
});

// ---------- Sitemap ----------
app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, "../frontend/public", "sitemap.xml"));
});

// =============================================
// 8. Start Server
// =============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
