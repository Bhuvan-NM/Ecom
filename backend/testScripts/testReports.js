// backend/testScripts/testReports.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  getLowStockReport,
  getMonthlySalesReport,
  getMonthlyRestockReport,
  getProfitReport,
  getSalesSummary,
} from "../services/SalesReportGen.js";

dotenv.config({ path: "../.env" }); // ✅ ESM-compatible way

const runReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("📦 Low Stock:", await getLowStockReport());
    console.log("💰 Monthly Sales:", await getMonthlySalesReport());
    console.log("🏗️ Monthly Restocks:", await getMonthlyRestockReport());
    console.log("💵 Profit Report:", await getProfitReport());
    console.log("📆 Sales Summary:", await getSalesSummary());
  } catch (err) {
    console.error("❌ Error running reports:", err);
  } finally {
    await mongoose.connection.close();
  }
};

runReports();
