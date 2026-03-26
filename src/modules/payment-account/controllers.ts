import { Request, Response } from "express";
import status from "http-status";
import { envVariables } from "../../config/env";
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

const generateClearDueCheckout = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized Access!");

    const result = await paymentAccountServices.createClearDueCheckout(
      user,
      envVariables.CLEAR_DUE_PAYMENT_SUCCESS_URL,
      envVariables.CLEAR_DUE_PAYMENT_CANCEL_URL,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Checkout session created",
      data: result,
    });
  },
);

export const paymentAccountControllers = {
  generateConnectLink,
  verifyConnectAccount,
  generateClearDueCheckout,
};
