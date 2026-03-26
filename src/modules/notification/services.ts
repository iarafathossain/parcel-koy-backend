import status from "http-status";
import AppError from "../errors/app-error";
import { prisma } from "../libs/prisma";

// Utility function to be used inside your other controllers (Parcel, Payout, etc.)
const sendNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

// Get all notifications for the logged-in user
const getMyNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // Newest first
  });
};

// Mark a specific notification as read when the user clicks on it
const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification)
    throw new AppError(status.NOT_FOUND, "Notification not found");
  if (notification.userId !== userId)
    throw new AppError(status.FORBIDDEN, "Access denied");

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

// Optional: Mark all as read (Very useful for frontend "Mark all as read" button)
const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const notificationServices = {
  sendNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
