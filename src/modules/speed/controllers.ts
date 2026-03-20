import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { serviceService } from "./services";

const createService = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await serviceService.createService(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Service created successfully",
    data: result,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await serviceService.getAllServices(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Services retrieved successfully",
    data: result.data ?? [],
    meta: result.meta,
  });
});

const getServiceBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await serviceService.getServiceBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Service retrieved successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await serviceService.updateService(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await serviceService.deleteService(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});

export const serviceControllers = {
  createService,
  getAllServices,
  getServiceBySlug,
  updateService,
  deleteService,
};
