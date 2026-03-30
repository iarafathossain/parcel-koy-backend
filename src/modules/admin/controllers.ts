import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { adminServices } from "./services";

const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await adminServices.updateAdminProfile(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin profile updated successfully",
    data: result,
  });
});

const softDeleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Admin ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Admin ID must be a string");
  }

  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await adminServices.softDeleteAdmin(id, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin soft deleted successfully",
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await adminServices.getAllAdmins(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getSingleAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Admin ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Admin ID must be a string");
  }

  const result = await adminServices.getSingleAdminById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

const getSingleAdminByEmail = catchAsync(
  async (req: Request, res: Response) => {
    const result = await adminServices.getSingleAdminByEmail(req.body);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  },
);

const deleteAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Admin ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(status.BAD_REQUEST, "Admin ID must be a string");
  }

  await adminServices.deleteAdminById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  await adminServices.deleteUser(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User deleted successfully",
  });
});

export const adminControllers = {
  updateAdminProfile,
  softDeleteAdmin,
  getAllAdmins,
  getSingleAdminById,
  getSingleAdminByEmail,
  deleteAdminById,
  deleteUser,
};
