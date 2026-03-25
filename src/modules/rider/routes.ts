import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { riderControllers } from "./controllers";
import {
  getSingleRiderByEmailZodSchema,
  updateRiderHubZodSchema,
  updateRiderProfileZodSchema,
} from "./validators";

const router = Router();

// PATCH: /api/v1/riders/profile - Update rider profile (Rider, Admin, Super Admin)
router.patch(
  "/profile",
  validateRequest(updateRiderProfileZodSchema),
  checkAuth("RIDER", "ADMIN", "SUPER_ADMIN"),
  riderControllers.updateRiderProfile,
);

// PATCH: /api/v1/riders/:id/hub - Update rider hub (Admin, Super Admin)
router.patch(
  "/:id/hub",
  validateRequest(updateRiderHubZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  riderControllers.updateRiderHub,
);

// PATCH: /api/v1/riders/soft-delete/:id - Soft delete rider (Admin, Super Admin)
router.patch(
  "/soft-delete/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  riderControllers.softDeleteRider,
);

// GET: /api/v1/riders - Get all riders (Admin, Super Admin)
router.get(
  "/",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  riderControllers.getAllRiders,
);

// POST: /api/v1/riders/by-email - Get rider by email (Admin, Super Admin)
router.post(
  "/by-email",
  validateRequest(getSingleRiderByEmailZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  riderControllers.getSingleRiderByEmail,
);

// GET: /api/v1/riders/:id/parcels - Get rider parcels (Admin, Super Admin, Rider, Merchant)
router.get(
  "/:id/parcels",
  checkAuth("ADMIN", "SUPER_ADMIN", "RIDER", "MERCHANT"),
  riderControllers.getAllParcelByRider,
);

// GET: /api/v1/riders/my-cash-handovers - Get rider cash handover history (Rider, Admin, Super Admin)
router.get(
  "/my-cash-handovers",
  checkAuth("RIDER", "ADMIN", "SUPER_ADMIN"),
  riderControllers.getRiderCashHistory,
);

// GET: /api/v1/riders/:id - Get single rider by id (Public)
router.get("/:id", riderControllers.getSingleRiderById);

// DELETE: /api/v1/riders/:id - Delete rider by id (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  riderControllers.deleteRiderById,
);

export const riderRoutes = router;
