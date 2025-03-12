require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// ✅ FIX: Correctly configure CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json()); // Middleware for JSON request bodies
app.use(cookieParser()); // Middleware for parsing cookies

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

app.use("/auth", require("./routes/authRoutes")); // Authentication routes

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
