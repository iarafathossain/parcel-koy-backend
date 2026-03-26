import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { payoutController } from "./controllers";
import { createStripeCheckoutSessionZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/payouts/:payoutId/checkout-session - Create Stripe Checkout Session (Admin, Super Admin)
router.post(
  "/:payoutId/checkout-session",
  validateRequest(createStripeCheckoutSessionZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  payoutController.createStripeCheckoutSession,
);

export const payoutRoutes = router;
