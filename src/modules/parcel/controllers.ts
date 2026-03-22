import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { parcelServices } from "./services";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await parcelServices.createParcel(payload, user.userId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Parcel created successfully",
    data: result,
  });
});

export const parcelControllers = {
  createParcel,
};
