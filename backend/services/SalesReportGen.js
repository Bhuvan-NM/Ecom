import { Sale, Restock, Item } from "./models";

// Low Stock Report
export async function getLowStockReport(threshold = 10) {
  return await Item.find({ quantity: { $lt: threshold } });
}

// Monthly Sales Report
export async function getMonthlySalesReport() {
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
}

// Monthly Restock Report
export async function getMonthlyRestockReport() {
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
}

// Profit Report (Gross Profit)
export async function getProfitReport() {
  const sales = await Sale.aggregate([
    { $group: { _id: null, revenue: { $sum: "$total" } } },
  ]);

  const restocks = await Restock.aggregate([
    { $group: { _id: null, cost: { $sum: "$totalCost" } } },
  ]);

  const revenue = sales[0]?.revenue || 0;
  const cost = restocks[0]?.cost || 0;
  return { revenue, cost, profit: revenue - cost };
}
