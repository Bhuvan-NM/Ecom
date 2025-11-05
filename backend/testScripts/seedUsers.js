import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: "../.env" });

const DEFAULT_USERS = [
  {
    firstName: "Avery",
    lastName: "Henderson",
    email: "avery@example.com",
    phoneNumber: 5551230001,
    isAdmin: true,
  },
  {
    firstName: "Jordan",
    lastName: "Mitchell",
    email: "jordan@example.com",
    phoneNumber: 5551230002,
  },
  {
    firstName: "Skyler",
    lastName: "Nguyen",
    email: "skyler@example.com",
    phoneNumber: 5551230003,
  },
  {
    firstName: "Rowan",
    lastName: "Perez",
    email: "rowan@example.com",
    phoneNumber: 5551230004,
  },
];

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD ?? "Password123!";

const randomDateWithinDays = (daysBack = 45) => {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
};

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Add it to backend/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    const usersToInsert = DEFAULT_USERS.map((user, index) => {
      const createdAt = randomDateWithinDays(120);
      const lastActiveAt = randomDateWithinDays(30);
      return {
        ...user,
        password: hashedPassword,
        createdAt,
        updatedAt: createdAt,
        lastActiveAt,
      };
    });

    const emails = usersToInsert.map((user) => user.email);
    await User.deleteMany({ email: { $in: emails } });

    await User.insertMany(usersToInsert);

    console.log(
      `✅ Seeded ${usersToInsert.length} users. Default password: ${DEFAULT_PASSWORD}`
    );
  } catch (error) {
    console.error("❌ Failed to seed users:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
