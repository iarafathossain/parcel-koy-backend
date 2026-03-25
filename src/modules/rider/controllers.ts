import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { riderServices } from "./services";

const updateRiderProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await riderServices.updateRiderProfile(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider profile updated successfully",
    data: result,
  });
});

const updateRiderHub = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  const result = await riderServices.updateRiderHub(id, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider hub updated successfully",
    data: result,
  });
});

const softDeleteRider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  const result = await riderServices.softDeleteRider(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider soft deleted successfully",
    data: result,
  });
});

const getAllRiders = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await riderServices.getAllRiders(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Riders retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getSingleRiderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  const result = await riderServices.getSingleRiderById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider retrieved successfully",
    data: result,
  });
});

const getSingleRiderByEmail = catchAsync(
  async (req: Request, res: Response) => {
    const result = await riderServices.getSingleRiderByEmail(req.body);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Rider retrieved successfully",
      data: result,
    });
  },
);

const getAllParcelByRider = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const queryParams = req.query as IQueryParams;

  const result = await riderServices.getAllParcelByRider(id, queryParams, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider parcels retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const deleteRiderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Rider ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Rider ID must be a string");
  }

  await riderServices.deleteRiderById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider deleted successfully",
  });
});

const getRiderCashHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const riderIdFromQuery =
    typeof req.query.riderId === "string" ? req.query.riderId : undefined;

  const result = await riderServices.getRiderCashHistory(
    user,
    riderIdFromQuery,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Rider cash handovers retrieved successfully",
    data: result,
  });
});

export const riderControllers = {
  updateRiderProfile,
  updateRiderHub,
  softDeleteRider,
  getAllRiders,
  getSingleRiderById,
  getSingleRiderByEmail,
  getAllParcelByRider,
  deleteRiderById,
  getRiderCashHistory,
};
