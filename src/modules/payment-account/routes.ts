import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { paymentAccountControllers } from "./controllers";
import {
  stripeConnectOnboardingZodSchema,
  verifyStripeConnectZodSchema,
} from "./validators";

const router = Router();

// POST: /api/v1/payment-accounts/stripe-connect/onboard
router.post(
  "/stripe-connect/onboard",
  validateRequest(stripeConnectOnboardingZodSchema),
  checkAuth(Role.MERCHANT),
  paymentAccountControllers.generateConnectLink,
);

// POST: /api/v1/payment-accounts/stripe-connect/verify
router.post(
  "/stripe-connect/verify",
  validateRequest(verifyStripeConnectZodSchema),
  checkAuth(Role.MERCHANT),
  paymentAccountControllers.verifyConnectAccount,
);

// POST: /api/v1/payment-accounts/clear-due/checkout
router.post(
  "/clear-due/checkout",
  checkAuth(Role.MERCHANT),
  paymentAccountControllers.generateClearDueCheckout,
);

export const paymentAccountRoutes = router;
