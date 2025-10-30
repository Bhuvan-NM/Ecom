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

const RANGE_CONFIG = {
  day: {
    label: "day",
    window: 1,
    unit: "hour",
    format: "%m/%d %H:00",
  },
  week: {
    label: "week",
    window: 7,
    unit: "day",
    format: "%m/%d",
  },
  month: {
    label: "month",
    window: 30,
    unit: "day",
    format: "%m/%d",
  },
  ytd: {
    label: "ytd",
    window: null,
    unit: "month",
    format: "%Y-%m",
  },
  all: {
    label: "all",
    window: null,
    unit: "month",
    format: "%Y-%m",
  },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getRangeBounds(rangeKey = "month") {
  const now = new Date();
  const config = RANGE_CONFIG[rangeKey] ?? RANGE_CONFIG.month;

  if (rangeKey === "ytd") {
    const start = new Date(now.getFullYear(), 0, 1);
    const prevStart = new Date(now.getFullYear() - 1, 0, 1);
    const prevEnd = new Date(now.getFullYear(), 0, 1);
    return { start, end: now, prevStart, prevEnd, unit: config.unit, format: config.format };
  }

  if (rangeKey === "all") {
    return {
      start: new Date(0),
      end: now,
      prevStart: null,
      prevEnd: null,
      unit: config.unit,
      format: config.format,
    };
  }

  const windowMs = (config.window ?? 30) * MS_PER_DAY;
  const start = new Date(now.getTime() - windowMs + 1);
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(prevEnd.getTime() - windowMs);

  return { start, end: now, prevStart, prevEnd, unit: config.unit, format: config.format };
}

const NUMERIC_TYPES = ["double", "int", "long", "decimal"];

const toNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (value === null || value === undefined) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateChangePct = (current, previous) => {
  if (previous) {
    return ((current - previous) / previous) * 100;
  }
  return current > 0 ? 100 : 0;
};

const buildNormalizationStages = () => [
  {
    $addFields: {
      saleDateNormalized: {
        $let: {
          vars: {
            parsedSaleDate: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $type: "$saleDate" }, "date"] },
                    then: "$saleDate",
                  },
                  {
                    case: {
                      $and: [
                        { $eq: [{ $type: "$saleDate" }, "string"] },
                        { $ne: ["$saleDate", ""] },
                      ],
                    },
                    then: {
                      $dateFromString: {
                        dateString: "$saleDate",
                        onError: null,
                        onNull: null,
                      },
                    },
                  },
                ],
                default: null,
              },
            },
            fallbackDate: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $type: "$createdAt" }, "date"] },
                    then: "$createdAt",
                  },
                  {
                    case: { $eq: [{ $type: "$updatedAt" }, "date"] },
                    then: "$updatedAt",
                  },
                ],
                default: null,
              },
            },
          },
          in: {
            $ifNull: ["$$parsedSaleDate", "$$fallbackDate"],
          },
        },
      },
      totalNumeric: {
        $switch: {
          branches: [
            {
              case: { $in: [{ $type: "$total" }, NUMERIC_TYPES] },
              then: "$total",
            },
            {
              case: {
                $and: [
                  { $eq: [{ $type: "$total" }, "string"] },
                  { $ne: ["$total", ""] },
                ],
              },
              then: {
                $convert: {
                  input: "$total",
                  to: "double",
                  onError: null,
                  onNull: null,
                },
              },
            },
          ],
          default: null,
        },
      },
      salePriceNumeric: {
        $switch: {
          branches: [
            {
              case: { $in: [{ $type: "$salePrice" }, NUMERIC_TYPES] },
              then: "$salePrice",
            },
            {
              case: {
                $and: [
                  { $eq: [{ $type: "$salePrice" }, "string"] },
                  { $ne: ["$salePrice", ""] },
                ],
              },
              then: {
                $convert: {
                  input: "$salePrice",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          ],
          default: 0,
        },
      },
      quantitySoldNumeric: {
        $switch: {
          branches: [
            {
              case: { $in: [{ $type: "$quantitySold" }, NUMERIC_TYPES] },
              then: "$quantitySold",
            },
            {
              case: {
                $and: [
                  { $eq: [{ $type: "$quantitySold" }, "string"] },
                  { $ne: ["$quantitySold", ""] },
                ],
              },
              then: {
                $convert: {
                  input: "$quantitySold",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          ],
          default: 0,
        },
      },
    },
  },
  {
    $addFields: {
      revenueAmount: {
        $cond: [
          { $ne: ["$totalNumeric", null] },
          "$totalNumeric",
          {
            $multiply: ["$salePriceNumeric", "$quantitySoldNumeric"],
          },
        ],
      },
    },
  },
];

const buildMatchStage = (rangeStart, rangeEnd, inclusiveEnd = true) => {
  if (!rangeStart && !rangeEnd) {
    return null;
  }

  const match = {
    saleDateNormalized: {
      $ne: null,
    },
  };

  if (rangeStart) {
    match.saleDateNormalized.$gte = rangeStart;
  }

  if (rangeEnd) {
    match.saleDateNormalized[inclusiveEnd ? "$lte" : "$lt"] = rangeEnd;
  }

  return { $match: match };
};

export async function getSalesMetrics(range = "month") {
  try {
    const { start, end, prevStart, prevEnd, format } = getRangeBounds(range);

    const groupStage = {
      $group: {
        _id: {
          label: {
            $dateToString: {
              format,
              date: "$saleDateNormalized",
              timezone: "UTC",
            },
          },
        },
        revenue: { $sum: "$revenueAmount" },
        orders: { $sum: 1 },
      },
    };

    const normalizationStages = buildNormalizationStages();
    const currentMatchStage = buildMatchStage(start, end, true);
    const previousMatchStage = buildMatchStage(prevStart, prevEnd, false);

    const seriesPipeline = [...normalizationStages];
    if (currentMatchStage) {
      seriesPipeline.push(currentMatchStage);
    }
    seriesPipeline.push(
      groupStage,
      { $sort: { "_id.label": 1 } },
      {
        $project: {
          _id: 0,
          label: "$_id.label",
          revenue: 1,
          orders: 1,
        },
      }
    );

    const totalsPipeline = [...normalizationStages];
    if (currentMatchStage) {
      totalsPipeline.push(currentMatchStage);
    }
    totalsPipeline.push({
      $group: {
        _id: null,
        revenue: { $sum: "$revenueAmount" },
        orders: { $sum: 1 },
      },
    });

    const seriesRaw = await Sale.aggregate(seriesPipeline);
    const totalsRaw = await Sale.aggregate(totalsPipeline);

    let previousTotalsRaw = [];
    if (previousMatchStage) {
      const previousPipeline = [...normalizationStages, previousMatchStage, {
        $group: {
          _id: null,
          revenue: { $sum: "$revenueAmount" },
          orders: { $sum: 1 },
        },
      }];
      previousTotalsRaw = await Sale.aggregate(previousPipeline);
    }

    const series = seriesRaw.map((entry) => ({
      label: entry.label,
      revenue: toNumber(entry.revenue),
      orders: toNumber(entry.orders),
    }));

    const totalRevenue = toNumber(totalsRaw[0]?.revenue);
    const totalOrders = Math.round(toNumber(totalsRaw[0]?.orders));
    const previousRevenue = toNumber(previousTotalsRaw[0]?.revenue);
    const previousOrders = Math.round(toNumber(previousTotalsRaw[0]?.orders));

    const totalRevenueRounded = Number(totalRevenue.toFixed(2));
    const previousRevenueRounded = Number(previousRevenue.toFixed(2));
    const hasPreviousRevenue = previousTotalsRaw.length > 0;
    const revenueChangePct = hasPreviousRevenue
      ? calculateChangePct(totalRevenueRounded, previousRevenueRounded)
      : null;

    const hasPreviousOrders = previousTotalsRaw.length > 0;
    const ordersChangePct = hasPreviousOrders
      ? calculateChangePct(totalOrders, previousOrders)
      : null;

    const averageOrderValueRaw = totalOrders
      ? totalRevenueRounded / totalOrders
      : 0;
    const averageOrderValue = Number(averageOrderValueRaw.toFixed(2));
    let averageOrderValueChangePct = null;
    if (previousOrders > 0) {
      const previousAverageOrderValueRaw = previousRevenueRounded / previousOrders;
      const previousAverageOrderValue = Number(
        previousAverageOrderValueRaw.toFixed(2)
      );
      averageOrderValueChangePct = calculateChangePct(
        averageOrderValue,
        previousAverageOrderValue
      );
    }

    return {
      range,
      totalRevenue: totalRevenueRounded,
      totalOrders,
      averageOrderValue,
      revenueChangePct,
      ordersChangePct,
      averageOrderValueChangePct,
      series,
    };
  } catch (err) {
    console.error("❌ Error generating sales metrics:", err);
    throw err;
  }
}
