import cron from "node-cron";
import { prisma } from "../libs/prisma";

export const startNotificationCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("⏳ Running Cron Job: Cleaning up read notifications...");

      const result = await prisma.notification.deleteMany({
        where: {
          isRead: true,
        },
      });

      console.log(
        `🧹 Cron Job Completed: Deleted ${result.count} read notifications.`,
      );
    } catch (error) {
      console.error("❌ Error cleaning up notifications:", error);
    }
  });
};
