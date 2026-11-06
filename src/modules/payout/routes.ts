import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { payoutController } from "./controllers.js";
import { requestPayoutZodSchema } from "./validators.js";

const router = Router();

// GET: /api/v1/payouts - Get all payouts (Admin only)
router.get(
  "/transactions",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  payoutController.getAllPayouts,
);

// GET: /api/v1/payouts/pending - Get all pending payouts (Admin, Super Admin)
router.get(
  "/pending",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  payoutController.getAllPendingPayout,
);

// POST: /api/v1/payouts/request - Merchant requests a payout
router.post(
  "/request",
  validateRequest(requestPayoutZodSchema),
  checkAuth(Role.MERCHANT),
  payoutController.requestPayout,
);

// POST: /api/v1/payouts/:payoutId/process
router.post(
  "/:payoutId/process",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  payoutController.processPayout,
);

export const payoutRoutes = router;
