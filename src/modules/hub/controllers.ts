import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { hubService } from "./services";

const createHub = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await hubService.createHub(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Hub created successfully",
    data: result,
  });
});

const getAllHubs = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;
  const result = await hubService.getAllHubs(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Hubs retrieved successfully",
    data: result.data ?? [],
    meta: result.meta,
  });
});

const getHubBySlug = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const queryParams = req.query as IQueryParams;
  const result = await hubService.getHubBySlug(slug, queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Hub retrieved successfully",
    data: result,
  });
});

const updateHub = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const payload = req.body;

  const result = await hubService.updateHub(slug, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Hub updated successfully",
    data: result,
  });
});

const getHubCashCollections = catchAsync(
  async (req: Request, res: Response) => {
    const { hubId } = req.params;

    if (!hubId) {
      throw new AppError(status.BAD_REQUEST, "Hub ID is required");
    }

    if (typeof hubId !== "string") {
      throw new AppError(status.BAD_REQUEST, "Hub ID must be a string");
    }

    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;

    const result = await hubService.getHubCashCollections(hubId, date);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Hub cash collections retrieved successfully",
      data: result,
    });
  },
);

const deleteHub = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
    throw new AppError(status.BAD_REQUEST, "Slug parameter is required");
  }

  if (typeof slug !== "string") {
    throw new AppError(status.BAD_REQUEST, "Slug parameter must be a string");
  }

  const result = await hubService.deleteHub(slug);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Hub deleted successfully",
    data: result,
  });
});

export const hubControllers = {
  createHub,
  getAllHubs,
  getHubBySlug,
  updateHub,
  deleteHub,
  getHubCashCollections,
};
