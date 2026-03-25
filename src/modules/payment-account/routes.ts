import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { paymentAccountControllers } from "./controllers";
import {
  addPaymentAccountZodSchema,
  updatePaymentAccountZodSchema,
} from "./validators";

const router = Router();

// POST: /api/v1/payment-accounts - Add a payment account (Merchant, Admin)
router.post(
  "/",
  validateRequest(addPaymentAccountZodSchema),
  checkAuth(Role.MERCHANT, Role.ADMIN),
  paymentAccountControllers.addPaymentAccount,
);

// PATCH: /api/v1/payment-accounts/:id - Update a payment account (Merchant, Admin)
router.patch(
  "/:id",
  validateRequest(updatePaymentAccountZodSchema),
  checkAuth(Role.MERCHANT, Role.ADMIN),
  paymentAccountControllers.updatePaymentAccount,
);

// PATCH: /api/v1/payment-accounts/:id/toggle-active - Toggle active status (Merchant, Admin)
router.patch(
  "/:id/toggle-active",
  checkAuth(Role.MERCHANT, Role.ADMIN),
  paymentAccountControllers.toggleActivePaymentAccount,
);

// PATCH: /api/v1/payment-accounts/:id/set-default - Set default account (Merchant, Admin)
router.patch(
  "/:id/set-default",
  checkAuth(Role.MERCHANT, Role.ADMIN),
  paymentAccountControllers.setDefaultPaymentAccount,
);

export const paymentAccountRoutes = router;
