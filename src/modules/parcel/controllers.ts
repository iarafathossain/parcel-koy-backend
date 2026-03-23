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

const updateParcel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Parcel ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Parcel ID must be a string");
  }
  const user = req.user;
  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }
  const payload = req.body;

  const result = await parcelServices.updateParcel(id, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Parcel updated successfully",
    data: result,
  });
});

const updateParcelStatusByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Parcel ID is required");
    }
    if (typeof id !== "string") {
      throw new AppError(status.BAD_REQUEST, "Parcel ID must be a string");
    }

    const payload = req.body;

    const result = await parcelServices.updateParcelStatusByAdmin(id, payload);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Parcel status updated successfully",
      data: result,
    });
  },
);

const cancelParcelByMerchant = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Parcel ID is required");
    }
    if (typeof id !== "string") {
      throw new AppError(status.BAD_REQUEST, "Parcel ID must be a string");
    }

    const user = req.user;
    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const result = await parcelServices.cancelParcelByMerchant(
      id,
      req.body,
      user.userId,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Parcel cancelled successfully",
      data: result,
    });
  },
);

export const parcelControllers = {
  createParcel,
  updateParcel,
  updateParcelStatusByAdmin,
  cancelParcelByMerchant,
};
