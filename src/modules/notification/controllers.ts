import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { notificationServices } from "./services";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await notificationServices.getMyNotifications(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { id } = req.params;

  if (!id)
    throw new AppError(status.BAD_REQUEST, "Notification ID is required");

  if (typeof id !== "string")
    throw new AppError(status.BAD_REQUEST, "Invalid notification ID format");

  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await notificationServices.markAsRead(id, user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  await notificationServices.markAllAsRead(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

export const notificationControllers = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
