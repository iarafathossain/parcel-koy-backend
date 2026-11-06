import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { cashCollectionControllers } from "./controllers.js";
import { collectCashZodSchema } from "./validators.js";

const router = Router();

// GET: /api/v1/cash-collections - Get all cash collections (Admin & Super Admin only)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  cashCollectionControllers.getAllCashCollections,
);

// POST: /api/v1/cash-collections/collect/:riderId - Collect cash from a rider (admin & super admin only)
router.post(
  "/collect/:riderId",
  validateRequest(collectCashZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  cashCollectionControllers.collectCash,
);

export const cashCollectionRoutes = router;
