import dotenv from "dotenv";
import mongoose from "mongoose";
import { Item, Restock } from "../models/InventoryItem.js";

dotenv.config({ path: "../.env" });

const SAMPLE_SKU = "WM-1001";
const SAMPLE_SKU2 = "WM-1002";
const RESTOCK_QUANTITY = 200;

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

    if (!sampleItem || !sampleItem2) {
      throw new Error(
        "Sample items not found. Please run seedSale.js before seeding restocks."
      );
    }

    await Restock.create([
      {
        itemId: sampleItem._id,
        sku: sampleItem.sku,
        quantityAdded: RESTOCK_QUANTITY,
        costPerUnit: 9.99,
        totalCost: Number(
          (sampleItem.supplier.costPerUnit * RESTOCK_QUANTITY).toFixed(2)
        ),
        restockDate: new Date(),
      },
      {
        itemId: sampleItem2._id,
        sku: sampleItem2.sku,
        quantityAdded: RESTOCK_QUANTITY,
        costPerUnit: 99.99,
        totalCost: Number(
          (sampleItem2.supplier.costPerUnit * RESTOCK_QUANTITY).toFixed(2)
        ),
        restockDate: new Date(),
      },
    ]);

    console.log("✅ Restock data seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding restock data:", err);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
