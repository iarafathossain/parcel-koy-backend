import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { zoneService } from "./services";

const createZone = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await zoneService.createZone(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Zone created successfully",
    data: result,
  });
});

const getAllZones = catchAsync(async (_req: Request, res: Response) => {
  const result = await zoneService.getAllZones();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Zones retrieved successfully",
    data: result,
  });
});

const getZoneBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await zoneService.getZoneBySlug(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Zone retrieved successfully",
    data: result,
  });
});

const updateZone = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await zoneService.updateZone(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Zone updated successfully",
    data: result,
  });
});

const deleteZone = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await zoneService.deleteZone(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Zone deleted successfully",
    data: result,
  });
});

export const zoneControllers = {
  createZone,
  getAllZones,
  getZoneBySlug,
  updateZone,
  deleteZone,
};
