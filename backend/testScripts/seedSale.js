import mongoose from "mongoose";
import dotenv from "dotenv";
import { Item, Sale } from "../models/InventoryItem.js";

dotenv.config({ path: "../.env" });

const SAMPLE_SKU = "WM-1001";
const SAMPLE_SKU2 = "WM-1002";

const Item1Quantity = 2;
const Item2Quantity = 5;

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Add it to your .env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const sampleItem = await Item.findOne({ sku: SAMPLE_SKU });
    const sampleItem2 = await Item.findOne({ sku: SAMPLE_SKU2 });

    const sale = await Sale.create({
      itemId: sampleItem._id,
      sku: sampleItem.sku,
      quantitySold: Item1Quantity,
      salePrice: sampleItem.price,
      total: Number((sampleItem.price * Item1Quantity).toFixed(2)),
      costTotal: Number(
        (sampleItem.supplier.costPerUnit * Item1Quantity).toFixed(2)
      ),
    });

    const sale2 = await Sale.create({
      itemId: sampleItem2._id,
      sku: sampleItem2.sku,
      quantitySold: Item2Quantity,
      salePrice: sampleItem2.price,
      total: Number((sampleItem2.price * Item2Quantity).toFixed(2)),
    });

    console.log("✅ Sample Item:", sampleItem);
    console.log("✅ Sample Sale:", sale);
  } finally {
    await mongoose.connection.close();
  }
};

seed()
  .then(() => {
    console.log("🎉 Seed complete");
  })
  .catch((err) => {
    console.error("❌ Seed failed", err);
    process.exitCode = 1;
  });
