import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import reportRoutes from "./routes/reportRoute.js";
import authRoutes from "./routes/authRoute.js";
import "./models/InventoryItem.js";

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://ecom-t5ly.onrender.com", // Render deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Serve static files from frontend/dist
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    // All other routes -> React index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/api/reports", reportRoutes);
