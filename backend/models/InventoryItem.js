import mongoose from "mongoose";

// =====================
// Item Schema
// =====================
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  category: { type: String, index: true },
  price: { type: Number, required: true },
  discount: { type: Number, min: 0, default: 0 },
  quantity: { type: Number, required: true, default: 0 },
  supplier: {
    name: String,
    contact: String,
    costPerUnit: Number,
  },
  location: {
    warehouse: String,
    aisle: String,
    bin: String,
  },
  lastUpdated: { type: Date, default: Date.now },
  lastRestocked: { type: Date },
});

export const Item = mongoose.model("Item", itemSchema);

// =====================
// Sale Schema
// =====================
const saleSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  sku: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  customer: {
    name: String,
    email: String,
  },
  saleDate: { type: Date, default: () => new Date() },
  saleTime: {
    type: String,
    default: () =>
      new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Credit Card", "Debit Card", "Online"],
    default: "Cash",
  },
  total: { type: Number, required: true },
});

saleSchema.pre("save", async function (next) {
  try {
    if (!this.itemId || !this.quantitySold) return next();

    const ItemModel = mongoose.model("Item");
    const item = await ItemModel.findById(this.itemId);

    if (!item) {
      return next(new Error(`❌ Item not found for SKU ${this.sku}`));
    }

    if (item.quantity < this.quantitySold) {
      return next(
        new Error(
          `🚫 Not enough stock for SKU ${this.sku}. Available: ${item.quantity}, Requested: ${this.quantitySold}`
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});

saleSchema.post("save", async function (doc) {
  try {
    if (!doc.itemId || !doc.quantitySold) return;

    const ItemModel = mongoose.model("Item");
    const updatedItem = await ItemModel.findByIdAndUpdate(
      doc.itemId,
      {
        $inc: { quantity: -doc.quantitySold },
        $set: { lastUpdated: new Date() },
      },
      { new: true }
    );

    if (updatedItem && updatedItem.quantity < 0) {
      console.warn(
        `⚠️ [Inventory] Stock for ${doc.sku} went negative (${updatedItem.quantity}).`
      );
    } else {
      console.log(
        `✅ [Inventory] Reduced stock for ${doc.sku} by -${doc.quantitySold}`
      );
    }
  } catch (err) {
    console.error("❌ [Inventory] Failed to update item on sale:", err);
  }
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

restockSchema.post("save", async function (doc) {
  try {
    if (!doc.itemId || !doc.quantityAdded) return;

    const ItemModel = mongoose.model("Item");
    const updates = {
      $inc: { quantity: doc.quantityAdded },
      $set: { lastUpdated: new Date(), lastRestocked: new Date() },
    };

    if (doc.costPerUnit !== undefined) {
      updates.$set = {
        ...updates.$set,
        "supplier.costPerUnit": doc.costPerUnit,
      };
    }

    await ItemModel.findByIdAndUpdate(doc.itemId, updates, { new: true });

    console.log(
      `✅ [Inventory] Increased stock for ${doc.sku} by +${doc.quantityAdded}`
    );
  } catch (err) {
    console.error("❌ [Inventory] Failed to update item on restock:", err);
  }
});

export const Restock = mongoose.model("Restock", restockSchema);
