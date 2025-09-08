const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  quantity: Number,
});

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: String,
    category: String,
    quantity: Number,
    price: Number,
    supplier: {
      name: String,
      contactEmail: String,
    },
    images: [String],
    variants: [variantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", itemSchema);
