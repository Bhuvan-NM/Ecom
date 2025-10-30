import { Router } from "express";
import { Item, Sale, Restock } from "../models/InventoryItem.js";

const router = Router();

router.get("/inventory", async (req, res) => {
  try {
    const {
      search,
      sort = "name",
      order = "asc",
      page = 1,
      limit = 10,
      category,
      priceMin,
      priceMax,
      dateFrom,
      dateTo,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const priceFilters = {};
    if (priceMin !== undefined && priceMin !== "") {
      const minPrice = Number(priceMin);
      if (!Number.isNaN(minPrice)) priceFilters.$gte = minPrice;
    }
    if (priceMax !== undefined && priceMax !== "") {
      const maxPrice = Number(priceMax);
      if (!Number.isNaN(maxPrice)) priceFilters.$lte = maxPrice;
    }
    if (Object.keys(priceFilters).length) {
      query.price = priceFilters;
    }

    const dateFilters = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!Number.isNaN(from.getTime())) dateFilters.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        dateFilters.$lte = to;
      }
    }
    if (Object.keys(dateFilters).length) {
      query.lastUpdated = dateFilters;
    }

    const sortKey = typeof sort === "string" ? sort : "name";
    const sortOrder = String(order).toLowerCase() === "desc" ? -1 : 1;
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, totalCount, categories, priceStats] = await Promise.all([
      Item.find(query)
        .sort({ [sortKey]: sortOrder })
        .skip(skip)
        .limit(safeLimit),
      Item.countDocuments(query),
      Item.distinct("category"),
      Item.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
    ]);

    const priceRange = {
      min: priceStats[0]?.minPrice ?? 0,
      max: priceStats[0]?.maxPrice ?? 0,
    };
    const sanitizedCategories = categories.filter(Boolean).sort();

    res.json({
      items,
      totalCount,
      page: safePage,
      totalPages: Math.ceil(totalCount / safeLimit),
      categories: sanitizedCategories,
      priceRange,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch inventory items", error: error.message });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      quantity,
      discount,
      supplier = {},
    } = req.body;

    const supplierPayload = {};
    if (supplier?.name) supplierPayload.name = supplier.name;
    if (supplier?.contact) supplierPayload.contact = supplier.contact;
    if (supplier?.costPerUnit !== undefined) {
      const cpu = Number(supplier.costPerUnit);
      if (!Number.isNaN(cpu)) supplierPayload.costPerUnit = cpu;
    }

    const newItem = new Item({
      name,
      sku,
      category,
      price: Number(price) || 0,
      quantity: Number(quantity) || 0,
      discount: Number(discount) || 0,
      supplier: supplierPayload,
      lastUpdated: new Date(),
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "An item with this SKU already exists." });
    }

    res
      .status(500)
      .json({ message: "Failed to save item", error: error.message });
  }
});

router.put("/inventory/:id", async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      price,
      quantity,
      discount,
      supplier = {},
    } = req.body;

    const supplierPayload = {};
    if (supplier?.name) supplierPayload.name = supplier.name;
    if (supplier?.contact) supplierPayload.contact = supplier.contact;
    if (supplier?.costPerUnit !== undefined) {
      const cpu = Number(supplier.costPerUnit);
      if (!Number.isNaN(cpu)) supplierPayload.costPerUnit = cpu;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        sku,
        category,
        price: Number(price) || 0,
        quantity: Number(quantity) || 0,
        discount: Number(discount) || 0,
        supplier: supplierPayload,
        lastUpdated: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "An item with this SKU already exists." });
    }

    res
      .status(500)
      .json({ message: "Failed to update item", error: error.message });
  }
});

router.delete("/inventory/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete item", error: error.message });
  }
});

router.post("/inventory/sale", async (req, res) => {
  try {
    const sale = new Sale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record sale", error: error.message });
  }
});

router.post("/inventory/restock", async (req, res) => {
  try {
    const { itemId, sku, quantityAdded, costPerUnit, supplier = {} } = req.body;

    if (!itemId || !quantityAdded) {
      return res
        .status(400)
        .json({ message: "itemId and quantityAdded are required." });
    }

    const numericQuantity = Number(quantityAdded);
    const numericCostPerUnit = Number(costPerUnit ?? 0);
    const totalCost = numericCostPerUnit * numericQuantity;

    const restock = new Restock({
      itemId,
      sku,
      quantityAdded: numericQuantity,
      costPerUnit: numericCostPerUnit,
      supplier,
      totalCost,
    });
    await restock.save();

    const updatedItem = await Item.findById(itemId);

    res.status(201).json({ restock, item: updatedItem });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record restock", error: error.message });
  }
});

export default router;
