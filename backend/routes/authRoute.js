const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
require("dotenv").config();

const router = express.Router();

// ✅ Middleware to Add CORS Headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Generate a JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 3600000, // 1 hour expiration
    });

    // ✅ Send user data (without password) in response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber, email, password } = req.body;

    const updateFields = {
      firstName,
      lastName,
      phoneNumber,
      email,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newToken = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.json({
      message: "Profile updated successfully",
      token: newToken,
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        isAdmin: updatedUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/admin/overview", authMiddleware, requireAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});


module.exports = router;
