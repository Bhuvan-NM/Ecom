import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import reportRoutes from "./routes/reportRoute.js";
import authRoutes from "./routes/authRoute.js";
import inventoryRoutes from "./routes/inventoryRoute.js";
import "./models/InventoryItem.js";

dotenv.config();

const app = express();

// ----- CORS -----
const defaultOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  "https://ecom-t5ly.onrender.com", // your frontend
].filter(Boolean);

const normalizeOrigin = (origin = "") => origin.replace(/\/$/, "");
const allowedOrigins = new Set(defaultOrigins.map(normalizeOrigin));

console.log("🔐 CORS allowed origins:", [...allowedOrigins]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.has(normalizedOrigin)) return callback(null, true);
    console.warn(`❌ CORS blocked request from origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ----- Routes -----
app.use("/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", inventoryRoutes);

// ----- Serve frontend (AFTER API routes) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ----- Mongo + Server -----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 1337;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
