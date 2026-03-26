import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { payoutController } from "./controllers";
import { requestPayoutZodSchema } from "./validators";

const router = Router();

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
