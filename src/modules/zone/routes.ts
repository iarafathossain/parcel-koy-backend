import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { zoneControllers } from "./controllers.js";
import { createZoneZodSchema, updateZoneZodSchema } from "./validators.js";

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
