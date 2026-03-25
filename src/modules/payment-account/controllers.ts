import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { paymentAccountServices } from "./services";

const addPaymentAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await paymentAccountServices.addPaymentAccount(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Payment account added successfully",
    data: result,
  });
});

const updatePaymentAccount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(status.BAD_REQUEST, "Payment account ID is required");
  }

  if (typeof id !== "string") {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment account ID must be a string",
    );
  }

  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await paymentAccountServices.updatePaymentAccount(
    id,
    req.body,
    user,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payment account updated successfully",
    data: result,
  });
});

const toggleActivePaymentAccount = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Payment account ID is required");
    }

    if (typeof id !== "string") {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment account ID must be a string",
      );
    }

    const user = req.user;

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const result = await paymentAccountServices.toggleActivePaymentAccount(
      id,
      user,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Payment account active status toggled successfully",
      data: result,
    });
  },
);

const setDefaultPaymentAccount = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError(status.BAD_REQUEST, "Payment account ID is required");
    }

    if (typeof id !== "string") {
      throw new AppError(
        status.BAD_REQUEST,
        "Payment account ID must be a string",
      );
    }

    const user = req.user;

    if (!user) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Unauthorized Access! User not found in request",
      );
    }

    const result = await paymentAccountServices.setDefaultPaymentAccount(
      id,
      user,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Default payment account updated successfully",
      data: result,
    });
  },
);

export const paymentAccountControllers = {
  addPaymentAccount,
  updatePaymentAccount,
  toggleActivePaymentAccount,
  setDefaultPaymentAccount,
};
