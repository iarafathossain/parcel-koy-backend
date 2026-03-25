import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { cashCollectionServices } from "./services";

export const collectCash = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const { riderId } = req.params;

  if (!riderId) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof riderId !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  const result = await cashCollectionServices.collectCash(
    user.userId,
    riderId,
    req.body,
  );

  res.status(status.OK).json({
    success: true,
    message: "Cash collected successfully",
    data: result,
  });
});

export const cashCollectionControllers = {
  collectCash,
};
