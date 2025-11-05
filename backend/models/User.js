import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
  },
  {
    collection: "user-data",
    timestamps: true,
  }
);

export default mongoose.model("UserData", UserSchema);
