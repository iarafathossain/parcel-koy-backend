import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { areaControllers } from "./controllers.js";
import { createAreaZodSchema, updateAreaZodSchema } from "./validators.js";

const router = Router();

// POST: /api/v1/areas/ - Create a new area (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createAreaZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  areaControllers.createArea,
);

// GET: /api/v1/areas/ - Get all areas (Public)
router.get("/", areaControllers.getAllAreas);

// GET: /api/v1/areas/:slug - Get area by slug (Public)
router.get("/:slug", areaControllers.getAreaBySlug);

// PATCH: /api/v1/areas/:slug - Update area by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateAreaZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  areaControllers.updateArea,
);

// DELETE: /api/v1/areas/:slug - Delete area by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  areaControllers.deleteArea,
);

export const areaRoutes = router;
