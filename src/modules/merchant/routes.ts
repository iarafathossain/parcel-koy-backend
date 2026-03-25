import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
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
  checkAuth(Role.MERCHANT, Role.ADMIN, Role.SUPER_ADMIN),
  merchantControllers.updateMerchantProfile,
);

// DELETE: /api/v1/merchants/:id - Soft delete merchant (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  merchantControllers.softDeleteMerchant,
);

// GET: /api/v1/merchants - Get all merchants (Admin, Super Admin)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  merchantControllers.getAllMerchants,
);

// POST: /api/v1/merchants/by-email - Get merchant by email (Admin, Super Admin)
router.post(
  "/by-email",
  validateRequest(getSingleMerchantByEmailZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  merchantControllers.getSingleMerchantByEmail,
);

// GET: /api/v1/merchants/:id/parcels - Get merchant parcels (Admin, Super Admin, Rider, Merchant)
router.get(
  "/:id/parcels",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RIDER, Role.MERCHANT),
  merchantControllers.getAllParcelByMerchantId,
);

// DELETE: /api/v1/merchants/:id/permanent - Permanent delete merchant (Admin, Super Admin)
router.delete(
  "/:id/permanent",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  merchantControllers.deleteMerchantById,
);

// GET: /api/v1/merchants/:id - Get single merchant by id (Rider, Admin, Super Admin, Merchant)
router.get(
  "/:id",
  checkAuth(Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN, Role.MERCHANT),
  merchantControllers.getSingleMerchantById,
);

export const merchantRoutes = router;
