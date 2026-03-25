import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { cashCollectionControllers } from "./controllers";
import { collectCashZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/cash-collections/collect/:riderId - Collect cash from a rider (admin & super admin only)
router.post(
  "/collect/:riderId",
  validateRequest(collectCashZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  cashCollectionControllers.collectCash,
);

export const cashCollectionRoutes = router;
