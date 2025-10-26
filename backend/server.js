import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import reportRoutes from "./routes/reportRoute.js";
import authRoutes from "./routes/authRoute.js";
import "./models/InventoryItem.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 1337;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/api/reports", reportRoutes);
