import { Request, Response } from "express";
import status from "http-status";
import Stripe from "stripe";
import { envVariables } from "../../config/env";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { payoutService } from "./services";

const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET_KEY);

const handleStripeWebhookEvent = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = envVariables.STRIPE.STRIPE_WEBHOOK_SECRET;

  if (!signature || typeof signature !== "string" || !webhookSecret) {
    return res.status(status.BAD_REQUEST).json({
      success: false,
      message: "Missing Stripe signature or webhook secret.",
    });
  }

  if (!Buffer.isBuffer(req.body) && typeof req.body !== "string") {
    return res.status(status.BAD_REQUEST).json({
      success: false,
      message: "Invalid webhook payload format. Raw body is required.",
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error constructing Stripe webhook event:", error);
    return res.status(status.BAD_REQUEST).json({
      success: false,
      message: "Error processing Stripe webhook event.",
    });
  }

  try {
    const result = await payoutService.handleStripeWebhookEvent(event);

    return res.status(status.OK).json({
      success: true,
      message: "Stripe webhook event processed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    return res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error processing Stripe webhook event.",
    });
  }
};

const createStripeCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const { payoutId } = req.params;

    if (!payoutId) {
      throw new AppError(status.BAD_REQUEST, "Payout ID is required");
    }

    if (typeof payoutId !== "string") {
      throw new AppError(status.BAD_REQUEST, "Payout ID must be a string");
    }

    const result = await payoutService.createStripeCheckoutSessionForPayout(
      payoutId,
      req.body,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Stripe checkout session created successfully",
      data: result,
    });
  },
);

export const payoutController = {
  handleStripeWebhookEvent,
  createStripeCheckoutSession,
};
