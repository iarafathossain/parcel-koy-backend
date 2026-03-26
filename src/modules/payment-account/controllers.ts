import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { paymentAccountServices } from "./services";

const generateConnectLink = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized Access!");

  const { successReturnUrl, refreshUrl } = req.body;

  const result = await paymentAccountServices.createStripeConnectOnboardingLink(
    user,
    successReturnUrl,
    refreshUrl,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stripe Connect onboarding link generated",
    data: result,
  });
});

const verifyConnectAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized Access!");

  const { accountId } = req.body;

  const result = await paymentAccountServices.verifyStripeConnectAccount(
    user,
    accountId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stripe Connect account verified",
    data: result,
  });
});

export const paymentAccountControllers = {
  generateConnectLink,
  verifyConnectAccount,
};
