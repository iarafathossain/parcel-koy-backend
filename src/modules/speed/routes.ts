import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { speedControllers } from "./controllers";
import { createSpeedZodSchema, updateSpeedZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/speeds/ - Create a new speed (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createSpeedZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  speedControllers.createSpeed,
);

// GET: /api/v1/speeds/ - Get all speeds (Public)
router.get("/", speedControllers.getAllSpeeds);

// GET: /api/v1/speeds/:slug - Get speed by slug (Public)
router.get("/:slug", speedControllers.getSpeedBySlug);

// PATCH: /api/v1/speeds/:slug - Update speed by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateSpeedZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  speedControllers.updateSpeed,
);

// DELETE: /api/v1/speeds/:slug - Delete speed by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  speedControllers.deleteSpeed,
);

export const speedRoutes = router;
