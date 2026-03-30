import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { parcelServices } from "./services";

const getAllParcels = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await parcelServices.getAllParcels(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Parcels retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

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

  const result = await parcelServices.updateParcel(id, payload, user.userId);

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

    const user = req.user;
    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const payload = req.body;

    const result = await parcelServices.updateParcelStatusByAdmin(
      id,
      payload,
      user.userId,
    );

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

const updateParcelStatusByRider = catchAsync(
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

    const payload = req.body;

    const result = await parcelServices.updateParcelStatusByRider(
      id,
      user.userId,
      payload,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Parcel status updated successfully",
      data: result,
    });
  },
);

const sendDeliveryOTP = catchAsync(async (req: Request, res: Response) => {
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

  await parcelServices.sendDeliveryOTP(id, user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Delivery OTP sent successfully",
  });
});

const verifyAndDeliverParcel = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Parcel ID is required");
    }
    if (typeof id !== "string") {
      throw new AppError(status.BAD_REQUEST, "Parcel ID must be a string");
    }

    const { otp } = req.body;

    const result = await parcelServices.verifyAndDeliverParcel(id, otp);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Parcel delivered successfully",
      data: result,
    });
  },
);

const getParcelHubTracking = catchAsync(async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  if (!trackingId || typeof trackingId !== "string") {
    throw new AppError(status.BAD_REQUEST, "Tracking ID is required");
  }

  const result = await parcelServices.getParcelHubTracking(trackingId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Parcel hub tracking retrieved successfully",
    data: result,
  });
});

export const parcelControllers = {
  getAllParcels,
  createParcel,
  updateParcel,
  updateParcelStatusByAdmin,
  cancelParcelByMerchant,
  updateParcelStatusByRider,
  sendDeliveryOTP,
  verifyAndDeliverParcel,
  getParcelHubTracking,
};
