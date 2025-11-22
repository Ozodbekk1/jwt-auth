/** @format */
// src/utils/cleanupJob.js
import cron from "node-cron";
import userModel from "../models/user.model.js";

// Har 10 minutda unverified userlarni o'chirish
export const startCleanupJob = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      // 30 minut ichida verify qilmagan userlarni o'chirish
      const result = await userModel.deleteMany({
        isVerified: false,
        createdAt: {
          $lt: new Date(Date.now() - 30 * 60 * 1000),
        },
      });

      if (result.deletedCount > 0) {
        console.log(`🗑️  ${result.deletedCount} ta unverified user o'chirildi`);
      }
    } catch (error) {
      console.error("Cleanup job error:", error);
    }
  });

  console.log("✅ Cleanup job started - this will work every 10 minutes !");
};
