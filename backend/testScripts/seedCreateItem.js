import mongoose from "mongoose";
import dotenv from "dotenv";
import { Item } from "../models/InventoryItem.js";

dotenv.config({ path: "../.env" });

const SAMPLE_SKU = "WM-1001";
const SAMPLE_SKU2 = "WM-1002";
const SAMPLE_SKU3 = "WM-1002";

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Add it to your .env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const sampleItem = await Item.findOneAndUpdate(
      { sku: SAMPLE_SKU },
      {
        name: "Wireless Mouse",
        category: "Electronics",
        price: 99.99,
        quantity: 50,
        discount: 5,
        supplier: {
          name: "Gamer Supplies Co.",
          contact: "",
          costPerUnit: 50.0,
        },
        lastRestocked: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sampleItem2 = await Item.findOneAndUpdate(
      { sku: SAMPLE_SKU2 },
      {
        name: "Gaming Mouse",
        category: "Electronics",
        price: 199.99,
        quantity: 50,
        discount: 10,
        supplier: {
          name: "Gamer Supplies Co.",
          contact: "",
          costPerUnit: 100.0,
        },
        lastRestocked: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log("✅ Sample Item 1:", sampleItem);
    console.log("✅ Sample Item 2:", sampleItem2);
  } catch (err) {
    console.error("❌ Error seeding item data:", err);
  } finally {
    await mongoose.connection.close();
  }
};

seed();
