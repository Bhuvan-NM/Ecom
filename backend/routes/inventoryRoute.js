const express = require("express");
const { Item: InventoryItem } = require("../models/InventoryItem");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

// Initialize Router
const router = express.Router();

// ✅ Middleware to Add CORS Headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router.post("/inventory", async (req, res) => {
  try {
    const newItem = new InventoryItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to save item", error: err });
  }
});

module.exports = router;
