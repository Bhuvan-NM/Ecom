// backend/routes/reportRoutes.js
import express from "express";
import {
  getLowStockReport,
  getMonthlySalesReport,
  getMonthlyRestockReport,
  getProfitReport,
  getSalesSummary,
} from "../services/SalesReportGen.js";

const router = express.Router();

// 📊 Route for dashboard summary
router.get("/sales-summary", async (req, res) => {
  try {
    const data = await getSalesSummary();
    res.json(data);
  } catch (err) {
    console.error("❌ Error generating sales summary:", err);
    res.status(500).json({ error: "Failed to generate sales summary" });
  }
});

// 💰 Profit report
router.get("/profit", async (req, res) => {
  try {
    const data = await getProfitReport();
    res.json(data);
  } catch (err) {
    console.error("❌ Error generating profit report:", err);
    res.status(500).json({ error: "Failed to generate profit report" });
  }
});

// 🏗️ Restock report
router.get("/restocks", async (req, res) => {
  try {
    const data = await getMonthlyRestockReport();
    res.json(data);
  } catch (err) {
    console.error("❌ Error generating restock report:", err);
    res.status(500).json({ error: "Failed to generate restock report" });
  }
});

// 📦 Low stock
router.get("/low-stock", async (req, res) => {
  try {
    const data = await getLowStockReport();
    res.json(data);
  } catch (err) {
    console.error("❌ Error generating low stock report:", err);
    res.status(500).json({ error: "Failed to generate low stock report" });
  }
});

export default router;
