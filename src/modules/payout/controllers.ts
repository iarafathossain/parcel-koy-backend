import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { payoutService } from "./services";

const getAllPayouts = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await payoutService.getAllPayouts(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payouts retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const getAllPendingPayout = catchAsync(async (req: Request, res: Response) => {
  const queryParams = req.query as IQueryParams;

  const result = await payoutService.getAllPendingPayout(queryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pending payouts retrieved successfully",
    data: result?.data ?? [],
    meta: result?.meta,
  });
});

const requestPayout = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized Access");

  const result = await payoutService.createPayoutRequest(user, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Payout request submitted successfully",
    data: result,
  });
});

const processPayout = catchAsync(async (req: Request, res: Response) => {
  const { payoutId } = req.params;

  if (!payoutId)
    throw new AppError(status.BAD_REQUEST, "Payout ID is required");

  if (typeof payoutId !== "string")
    throw new AppError(status.BAD_REQUEST, "Payout ID must be a string");

  const result = await payoutService.processStripePayout(payoutId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Payout successfully transferred via Stripe Connect",
    data: result,
  });
});

export const payoutController = {
  getAllPayouts,
  getAllPendingPayout,
  requestPayout,
  processPayout,
};
