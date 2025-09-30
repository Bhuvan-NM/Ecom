import mongoose from "mongoose";

// =====================
// Item Schema
// =====================
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true }, // Stock Keeping Unit
  category: { type: String, index: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 }, // current stock
  supplier: {
    name: String,
    contact: String,
  },
  location: {
    warehouse: String,
    aisle: String,
    bin: String,
  },
  lastUpdated: { type: Date, default: Date.now },
});

export const Item = mongoose.model("Item", itemSchema);

// =====================
// Sale Schema
// =====================
const saleSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  sku: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true }, // store price at time of sale
  customer: {
    name: String,
    email: String,
  },
  saleDate: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Credit Card", "Debit Card", "Online"],
    default: "Cash",
  },
  total: { type: Number, required: true },
});

export const Sale = mongoose.model("Sale", saleSchema);

// =====================
// Restock Schema
// =====================
const restockSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  sku: { type: String, required: true },
  quantityAdded: { type: Number, required: true },
  costPerUnit: { type: Number, required: true },
  supplier: {
    name: String,
    contact: String,
  },
  restockDate: { type: Date, default: Date.now },
  totalCost: { type: Number, required: true },
});

export const Restock = mongoose.model("Restock", restockSchema);
