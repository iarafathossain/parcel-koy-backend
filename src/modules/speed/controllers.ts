import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error.js";
import { IQueryParams } from "../../interfaces/query-type.js";
import { catchAsync } from "../../shared/catch-async.js";
import { sendResponse } from "../../shared/send-response.js";
import { speedServices } from "./services.js";

const createSpeed = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await speedServices.createSpeed(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Speed created successfully",
    data: result,
  });
});

const getAllSpeeds = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await speedServices.getAllSpeeds(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speeds retrieved successfully",
    data: result.data ?? [],
    meta: result.meta,
  });
});

const getSpeedBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await speedServices.getSpeedBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speed retrieved successfully",
    data: result,
  });
});

const updateSpeed = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await speedServices.updateSpeed(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speed updated successfully",
    data: result,
  });
});

const deleteSpeed = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await speedServices.deleteSpeed(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Speed deleted successfully",
    data: result,
  });
});

export const speedControllers = {
  createSpeed,
  getAllSpeeds,
  getSpeedBySlug,
  updateSpeed,
  deleteSpeed,
};
