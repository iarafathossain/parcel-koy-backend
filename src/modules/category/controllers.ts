import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error.js";
import { IQueryParams } from "../../interfaces/query-type.js";
import { catchAsync } from "../../shared/catch-async.js";
import { sendResponse } from "../../shared/send-response.js";
import { categoryServices } from "./services.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await categoryServices.createCategory(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await categoryServices.getAllCategories(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await categoryServices.getCategoryBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await categoryServices.updateCategory(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await categoryServices.deleteCategory(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryControllers = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
