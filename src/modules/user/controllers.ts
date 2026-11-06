import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catch-async.js";
import { sendResponse } from "../../shared/send-response.js";
import { userService } from "./services.js";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const createRider = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createRider(req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Rider created successfully",
    data: result,
  });
});

export const userController = {
  createAdmin,
  createRider,
};
