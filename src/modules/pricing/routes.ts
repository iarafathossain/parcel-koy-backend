import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { pricingControllers } from "./controllers";
import {
  createPricingZodSchema,
  getDeliveryChargeZodSchema,
  updatePricingZodSchema,
} from "./validators";

const router = Router();

// POST: /api/v1/pricing/ - Create a new pricing rule (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createPricingZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  pricingControllers.createPricing,
);

// GET: /api/v1/pricing/ - Get all pricing rules (Public)
router.get("/", pricingControllers.getAllPricing);

// POST: /api/v1/pricing/delivery-charge - Calculate delivery charge (Public)
router.post(
  "/delivery-charge",
  validateRequest(getDeliveryChargeZodSchema),
  pricingControllers.getDeliveryCharge,
);

// GET: /api/v1/pricing/:id - Get pricing rule by ID (Public)
router.get("/:id", pricingControllers.getPricingById);

// PATCH: /api/v1/pricing/:id - Update pricing rule by ID (Admin & Super Admin)
router.patch(
  "/:id",
  validateRequest(updatePricingZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  pricingControllers.updatePricing,
);

// DELETE: /api/v1/pricing/:id - Delete pricing rule by ID (Admin & Super Admin)
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  pricingControllers.deletePricing,
);

export const pricingRoutes = router;
