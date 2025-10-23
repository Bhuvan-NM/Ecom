require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { Item, Sale } = require("../models/InventoryItem");

const SAMPLE_SKU = "WM-1001";
const SAMPLE_SKU2 = "WM-1002";

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
        price: 29.99,
        quantity: 50,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sampleItem2 = await Item.findOneAndUpdate(
      { sku: SAMPLE_SKU },
      {
        name: "Wireless Mouse",
        category: "Electronics",
        price: 299.99,
        quantity: 50,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const sale = await Sale.create({
      itemId: sampleItem._id,
      sku: sampleItem.sku,
      quantitySold: 2,
      salePrice: sampleItem.price,
      total: Number((sampleItem.price * 2).toFixed(2)),
    });

    const sale2 = await Sale.create({
      itemId: sampleItem2._id,
      sku: sampleItem2.sku,
      quantitySold: 5,
      salePrice: sampleItem2.price,
      total: Number((sampleItem2.price * 2).toFixed(2)),
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
