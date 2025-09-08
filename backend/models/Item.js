const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    itemImage: { type: Image, required: false },
    itemName: { type: String, required: true },
    itemCost: { type: Number, required: true },
    itemStockOnHand: { type: Number, required: false },
    discount: { type: Number, required: true, unique: true },
  },
  { collection: "user-data" }
);

module.exports = mongoose.model("UserData", UserSchema);
