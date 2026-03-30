import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { pricingServices } from "./services";

const createPricing = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await pricingServices.createPricing(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Pricing rule created successfully",
    data: result,
  });
});

const getAllPricing = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await pricingServices.getAllPricing(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pricing rules retrieved successfully",
    data: result.data ?? [],
    meta: result.meta,
  });
});

const getPricingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter is required",
    );
  }

  if (typeof id !== "string") {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter must be a string",
    );
  }

  const queryParams = req.query as IQueryParams;
  const result = await pricingServices.getPricingById(id, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pricing rule retrieved successfully",
    data: result,
  });
});

const updatePricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter is required",
    );
  }

  if (typeof id !== "string") {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter must be a string",
    );
  }

  const payload = req.body;

  const result = await pricingServices.updatePricing(id, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pricing rule updated successfully",
    data: result,
  });
});

const deletePricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter is required",
    );
  }

  if (typeof id !== "string") {
    throw new AppError(
      status.BAD_REQUEST,
      "Pricing rule ID parameter must be a string",
    );
  }

  const result = await pricingServices.deletePricing(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pricing rule deleted successfully",
    data: result,
  });
});

const getDeliveryCharge = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await pricingServices.getDeliveryCharge(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Delivery charge calculated successfully",
    data: result,
  });
});

export const pricingControllers = {
  createPricing,
  getAllPricing,
  getPricingById,
  updatePricing,
  deletePricing,
  getDeliveryCharge,
};
