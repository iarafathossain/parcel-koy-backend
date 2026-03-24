import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { merchantServices } from "./services";

const updateMerchantProfile = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const result = await merchantServices.updateMerchantProfile(req.body, user);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Merchant profile updated successfully",
      data: result,
    });
  },
);

const softDeleteMerchant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Merchant ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Merchant ID must be a string");
  }

  const result = await merchantServices.softDeleteMerchant(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Merchant soft deleted successfully",
    data: result,
  });
});

const getAllMerchants = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await merchantServices.getAllMerchants(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Merchants retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getSingleMerchantById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Merchant ID is required");
    }

    if (typeof id !== "string") {
      throw new AppError(status.BAD_REQUEST, "Merchant ID must be a string");
    }

    const result = await merchantServices.getSingleMerchantById(id);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Merchant retrieved successfully",
      data: result,
    });
  },
);

const getSingleMerchantByEmail = catchAsync(
  async (req: Request, res: Response) => {
    const result = await merchantServices.getSingleMerchantByEmail(req.body);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Merchant retrieved successfully",
      data: result,
    });
  },
);

const getAllParcelByMerchantId = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Merchant ID is required");
    }

    if (typeof id !== "string") {
      throw new AppError(status.BAD_REQUEST, "Merchant ID must be a string");
    }

    const user = req.user;

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const queryParams = req.query as IQueryParams;

    const result = await merchantServices.getAllParcelByMerchantId(
      id,
      queryParams,
      user,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Merchant parcels retrieved successfully",
      data: result?.data ?? [],
      meta: result?.meta,
    });
  },
);

const deleteMerchantById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Merchant ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Merchant ID must be a string");
  }

  await merchantServices.deleteMerchantById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Merchant deleted successfully",
  });
});

export const merchantControllers = {
  updateMerchantProfile,
  softDeleteMerchant,
  getAllMerchants,
  getSingleMerchantById,
  getSingleMerchantByEmail,
  getAllParcelByMerchantId,
  deleteMerchantById,
};
