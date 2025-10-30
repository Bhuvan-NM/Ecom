import mongoose from "mongoose";
import dotenv from "dotenv";
import { Item, Sale } from "../models/InventoryItem.js";

dotenv.config({ path: "../.env" });

const ITEM_COUNT = Number(process.env.SEED_ITEM_COUNT ?? 200);
const SALE_COUNT = Number(process.env.SEED_SALE_COUNT ?? 6000);

const ITEM_SKU_PREFIX = "SIM-";
const DATE_RANGE_YEARS = 4;

const categories = [
  "Electronics",
  "Gaming",
  "Home Office",
  "Accessories",
  "Audio",
  "Smart Home",
  "Outdoor",
  "Fitness",
];

const productAdjectives = [
  "Quantum",
  "Neon",
  "Apex",
  "Pulse",
  "Vivid",
  "Nimbus",
  "Echo",
  "Vector",
  "Solar",
  "Aurora",
];

const productNouns = [
  "Headset",
  "Keyboard",
  "Speaker",
  "Mouse",
  "Drone",
  "Projector",
  "Lamp",
  "Camera",
  "Tracker",
  "Router",
  "Tablet",
  "Console",
  "Monitor",
];

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Online"];

const randomFrom = (array) => array[Math.floor(Math.random() * array.length)];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

const randomDateWithinYears = (yearsBack) => {
  const now = new Date();
  const past = new Date(now);
  past.setFullYear(now.getFullYear() - yearsBack);
  const start = past.getTime();
  const end = now.getTime();
  return new Date(randomInt(start, end));
};

const createSku = (index) => {
  const sequence = String(index + 1).padStart(4, "0");
  const suffix = randomInt(100, 999);
  return `${ITEM_SKU_PREFIX}${sequence}${suffix}`;
};

const buildItemPayload = (index) => {
  const adjective = randomFrom(productAdjectives);
  const noun = randomFrom(productNouns);
  const category = randomFrom(categories);
  const basePrice = randomFloat(25, 799, 2);
  const discount =
    Math.random() < 0.25
      ? randomFloat(5, 30, 1)
      : Number((Math.random() < 0.1 ? randomFloat(30, 55, 1) : 0).toFixed(1));
  const quantity = randomInt(250, 1200);
  const costPerUnit = Number((basePrice * randomFloat(0.35, 0.65)).toFixed(2));
  const lastRestocked = randomDateWithinYears(DATE_RANGE_YEARS);

  return {
    name: `${adjective} ${noun}`,
    sku: createSku(index),
    category,
    price: basePrice,
    quantity,
    discount,
    supplier: {
      name: `${adjective} Supplies Co.`,
      contact: "",
      costPerUnit,
    },
    lastRestocked,
    lastUpdated: new Date(),
  };
};

const createSalePayload = (item) => {
  const saleDate = randomDateWithinYears(DATE_RANGE_YEARS);
  const quantitySold = randomInt(
    1,
    Math.min(8, Math.max(1, item.quantity / 4))
  );
  const salePrice = Number(item.price.toFixed(2));
  const total = Number((salePrice * quantitySold).toFixed(2));
  const paymentMethod = randomFrom(paymentMethods);

  return {
    itemId: item._id,
    sku: item.sku,
    quantitySold,
    salePrice,
    paymentMethod,
    total,
    saleDate,
    saleTime: saleDate
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .padStart(8, "0"),
  };
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Add it to your .env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    console.log(`📦 Generating ${ITEM_COUNT} items…`);
    const itemPayloads = Array.from({ length: ITEM_COUNT }, (_, idx) =>
      buildItemPayload(idx)
    );
    const createdItems = await Item.insertMany(itemPayloads, {
      ordered: false,
    });

    console.log(
      `🧾 Generating ${SALE_COUNT} sales across ${DATE_RANGE_YEARS} years…`
    );
    const salesPayloads = Array.from({ length: SALE_COUNT }, () => {
      const item = randomFrom(createdItems);
      return createSalePayload(item);
    });

    await Sale.insertMany(salesPayloads, { ordered: false });

    console.log(
      `✅ Seed complete: ${createdItems.length} items & ${salesPayloads.length} sales inserted.`
    );
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
