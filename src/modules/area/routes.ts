import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { areaControllers } from "./controllers";
import { createAreaZodSchema, updateAreaZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/areas/ - Create a new area (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createAreaZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
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
  checkAuth("ADMIN", "SUPER_ADMIN"),
  areaControllers.updateArea,
);

// DELETE: /api/v1/areas/:slug - Delete area by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  areaControllers.deleteArea,
);

export const areaRoutes = router;
