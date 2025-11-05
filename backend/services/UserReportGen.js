import mongoose from "mongoose";
import User from "../models/User.js";

export async function generateUserReport() {
  try {
    const users = await User.find()
      .select("firstName lastName email isAdmin createdAt updatedAt lastActiveAt")
      .sort({ createdAt: -1 })
      .lean();

    return users.map((user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastActiveAt: user.lastActiveAt,
    }));
  } catch (error) {
    console.error("Error generating user report:", error);
    throw error;
  }
}

export async function getUserStatistics() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fallbackObjectIdThreshold = new mongoose.Types.ObjectId(
      Math.floor(thirtyDaysAgo.getTime() / 1000).toString(16) + "0000000000000000"
    );

    const totalUsersPromise = User.countDocuments();
    const adminUsersPromise = User.countDocuments({ isAdmin: true });
    const recentSignupsPromise = User.countDocuments({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { createdAt: { $exists: false }, _id: { $gte: fallbackObjectIdThreshold } },
      ],
    });
    const activeUsersPromise = User.countDocuments({
      $or: [
        { lastActiveAt: { $gte: thirtyDaysAgo } },
        { lastActiveAt: { $exists: false }, updatedAt: { $gte: thirtyDaysAgo } },
      ],
    });

    const [totalUsers, adminUsers, recentSignups, activeLast30] = await Promise.all([
      totalUsersPromise,
      adminUsersPromise,
      recentSignupsPromise,
      activeUsersPromise,
    ]);

    return {
      totalUsers,
      adminUsers,
      recentSignups,
      activeLast30,
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    throw error;
  }
}
