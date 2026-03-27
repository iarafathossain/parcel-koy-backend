import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { statsService } from "./services";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await statsService.getDashboardStats(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
});

export const StatsController = {
  getDashboardStats,
};
