import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { areaService } from "./services";

const createArea = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await areaService.createArea(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Area created successfully",
    data: result,
  });
});

const getAllAreas = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await areaService.getAllAreas(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Areas retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getAreaBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await areaService.getAreaBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Area retrieved successfully",
    data: result,
  });
});

const updateArea = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await areaService.updateArea(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Area updated successfully",
    data: result,
  });
});

const deleteArea = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await areaService.deleteArea(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Area deleted successfully",
    data: result,
  });
});

export const areaControllers = {
  createArea,
  getAllAreas,
  getAreaBySlug,
  updateArea,
  deleteArea,
};
