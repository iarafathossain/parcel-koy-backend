import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error.js";
import { IQueryParams } from "../../interfaces/query-type.js";
import { catchAsync } from "../../shared/catch-async.js";
import { sendResponse } from "../../shared/send-response.js";
import { methodServices } from "./services.js";

const createMethod = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await methodServices.createMethod(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Method created successfully",
    data: result,
  });
});

const getAllMethods = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await methodServices.getAllMethods(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Methods retrieved successfully",
    data: result.data ?? [],
    meta: result.meta,
  });
});

const getMethodBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await methodServices.getMethodBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Method retrieved successfully",
    data: result,
  });
});

const updateMethod = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await methodServices.updateMethod(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Method updated successfully",
    data: result,
  });
});

const deleteMethod = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await methodServices.deleteMethod(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Method deleted successfully",
    data: result,
  });
});

export const methodControllers = {
  createMethod,
  getAllMethods,
  getMethodBySlug,
  updateMethod,
  deleteMethod,
};
