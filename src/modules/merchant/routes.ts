import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { merchantControllers } from "./controllers";
import {
  getSingleMerchantByEmailZodSchema,
  updateMerchantProfileZodSchema,
} from "./validators";

const router = Router();

// PATCH: /api/v1/merchants/profile - Update merchant profile (Merchant, Admin, Super Admin)
router.patch(
  "/profile",
  validateRequest(updateMerchantProfileZodSchema),
  checkAuth("MERCHANT", "ADMIN", "SUPER_ADMIN"),
  merchantControllers.updateMerchantProfile,
);

// DELETE: /api/v1/merchants/:id - Soft delete merchant (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  merchantControllers.softDeleteMerchant,
);

// GET: /api/v1/merchants - Get all merchants (Admin, Super Admin)
router.get(
  "/",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  merchantControllers.getAllMerchants,
);

// POST: /api/v1/merchants/by-email - Get merchant by email (Admin, Super Admin)
router.post(
  "/by-email",
  validateRequest(getSingleMerchantByEmailZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  merchantControllers.getSingleMerchantByEmail,
);

// GET: /api/v1/merchants/:id/parcels - Get merchant parcels (Admin, Super Admin, Rider, Merchant)
router.get(
  "/:id/parcels",
  checkAuth("ADMIN", "SUPER_ADMIN", "RIDER", "MERCHANT"),
  merchantControllers.getAllParcelByMerchantId,
);

// DELETE: /api/v1/merchants/:id/permanent - Permanent delete merchant (Admin, Super Admin)
router.delete(
  "/:id/permanent",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  merchantControllers.deleteMerchantById,
);

// GET: /api/v1/merchants/:id - Get single merchant by id (Rider, Admin, Super Admin, Merchant)
router.get(
  "/:id",
  checkAuth("RIDER", "ADMIN", "SUPER_ADMIN", "MERCHANT"),
  merchantControllers.getSingleMerchantById,
);

export const merchantRoutes = router;
