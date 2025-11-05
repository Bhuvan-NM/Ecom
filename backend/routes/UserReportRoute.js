import express from "express";
import {
  getUserStatistics,
  generateUserReport,
} from "../services/UserReportGen.js";

const router = express.Router();

// 📊 Route for user statistics

router.get("/user-statistics", async (req, res) => {
  try {
    const stats = await getUserStatistics();
    console.log("📈 User statistics response:", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Error fetching user statistics:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

// 📝 Route for generating user generateUserReport
router.get("/user-report", async (req, res) => {
  try {
    const report = await generateUserReport();
    res.json(report);
  } catch (err) {
    console.error("❌ Error generating user report:", err);
    res.status(500).json({ error: "Failed to generate user report" });
  }
});

export default router;
