import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import salesReportRoutes from "./routes/SalesReportRoute.js";
import authRoutes from "./routes/authRoute.js";
import inventoryRoutes from "./routes/inventoryRoute.js";
import { getUserStatistics, generateUserReport } from "./services/UserReportGen.js";
import "./models/InventoryItem.js";

dotenv.config();

const app = express();

// ----- CORS -----
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:1337",
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
app.use("/api/reports", salesReportRoutes);
app.use("/api", inventoryRoutes);

app.get("/api/reports/user-statistics", async (req, res) => {
  try {
    const stats = await getUserStatistics();
    console.log("📊 Responding with user statistics:", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Error fetching user statistics:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

app.get("/api/reports/user-report", async (req, res) => {
  try {
    const report = await generateUserReport();
    res.json(report);
  } catch (err) {
    console.error("❌ Error generating user report:", err);
    res.status(500).json({ error: "Failed to generate user report" });
  }
});

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
