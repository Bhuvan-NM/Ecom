// backend/services/SalesReportGen.js

import { Item, Sale, Restock } from "../models/InventoryItem.js";

/**
 * 📦 Low Stock Report
 * Returns all items where quantity < threshold (default = 10)
 */
export async function getLowStockReport(threshold = 10) {
  try {
    return await Item.find({ quantity: { $lt: threshold } });
  } catch (err) {
    console.error("❌ Error generating low stock report:", err);
    throw err;
  }
}

/**
 * 💰 Monthly Sales Report
 * Aggregates total quantity sold and total revenue grouped by year/month
 */
export async function getMonthlySalesReport() {
  try {
    return await Sale.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$saleDate" },
            month: { $month: "$saleDate" },
          },
          totalQuantity: { $sum: "$quantitySold" },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  } catch (err) {
    console.error("❌ Error generating monthly sales report:", err);
    throw err;
  }
}

/**
 * 🏗️ Monthly Restock Report
 * Aggregates total restocked quantity and cost grouped by year/month
 */
export async function getMonthlyRestockReport() {
  try {
    return await Restock.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$restockDate" },
            month: { $month: "$restockDate" },
          },
          totalAdded: { $sum: "$quantityAdded" },
          totalCost: { $sum: "$totalCost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
  } catch (err) {
    console.error("❌ Error generating monthly restock report:", err);
    throw err;
  }
}

/**
 * 💵 Profit Report (Gross)
 * Calculates total revenue, total restock cost, and profit
 */
export async function getProfitReport() {
  try {
    // Sum all sale totals (revenue)
    const sales = await Sale.aggregate([
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);

    // Sum all restock total costs
    const restocks = await Restock.aggregate([
      { $group: { _id: null, cost: { $sum: "$totalCost" } } },
    ]);

    // Sum all supplier costs (if applicable)
    const supplier = await Item.aggregate([
      {
        $group: { _id: null, supplierCost: { $sum: "$supplier.supplierCost" } },
      },
    ]);

    // Extract numbers safely
    const revenue = sales[0]?.revenue || 0;
    const restockCost = restocks[0]?.cost || 0;
    const supplierCost = supplier[0]?.supplierCost || 0;

    // Total cost includes both restocks and supplier costs
    const cost = restockCost + supplierCost;
    const profit = revenue - cost;

    return { revenue, cost, profit };
  } catch (err) {
    console.error("❌ Error generating profit report:", err);
    throw err;
  }
}

/**
 * 📆 Time-Based Sales Summary
 * Returns total sales for day, week, month, year, and year-to-date
 */
export async function getSalesSummary() {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const sumSales = async (fromDate) => {
      const result = await Sale.aggregate([
        { $match: { saleDate: { $gte: fromDate } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]);
      return result.length ? result[0].total : 0;
    };

    //Total Num of Orders
    const totalOrders = await Sale.countDocuments();

    return {
      day: await sumSales(startOfDay),
      week: await sumSales(startOfWeek),
      month: await sumSales(startOfMonth),
      year: await sumSales(startOfYear),
      yearToDate: await sumSales(startOfYear), // same as yearly total
      totalOrders,
    };
  } catch (err) {
    console.error("❌ Error generating sales summary:", err);
    throw err;
  }
}
