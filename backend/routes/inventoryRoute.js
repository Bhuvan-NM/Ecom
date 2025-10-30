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
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const sortKey = typeof sort === "string" ? sort : "name";
    const sortOrder = String(order).toLowerCase() === "desc" ? -1 : 1;
    const safeLimit = Math.min(parseInt(limit, 10) || 10, 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [items, totalCount] = await Promise.all([
      Item.find(query)
        .sort({ [sortKey]: sortOrder })
        .skip(skip)
        .limit(safeLimit),
      Item.countDocuments(query),
    ]);

    res.json({
      items,
      totalCount,
      page: safePage,
      totalPages: Math.ceil(totalCount / safeLimit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch inventory items", error: error.message });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save item", error: error.message });
  }
});

router.put("/inventory/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
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
    const restock = new Restock(req.body);
    await restock.save();
    res.status(201).json(restock);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to record restock", error: error.message });
  }
});

export default router;
