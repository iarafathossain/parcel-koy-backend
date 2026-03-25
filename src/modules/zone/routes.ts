import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { zoneControllers } from "./controllers";
import { createZoneZodSchema, updateZoneZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/zones/ - Create a new zone (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createZoneZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  zoneControllers.createZone,
);

// GET: /api/v1/zones/ - Get all zones (Public)
router.get("/", zoneControllers.getAllZones);

// GET: /api/v1/zones/:slug - Get zone by slug (Public)
router.get("/:slug", zoneControllers.getZoneBySlug);

// PATCH: /api/v1/zones/:slug - Update zone by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateZoneZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  zoneControllers.updateZone,
);

// DELETE: /api/v1/zones/:slug - Delete zone by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  zoneControllers.deleteZone,
);

export const zoneRoutes = router;
