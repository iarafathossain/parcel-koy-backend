import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { serviceControllers } from "./controllers";
import { createServiceZodSchema, updateServiceZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/services/ - Create a new service (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createServiceZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  serviceControllers.createService,
);

// GET: /api/v1/services/ - Get all services (Public)
router.get("/", serviceControllers.getAllServices);

// GET: /api/v1/services/:slug - Get service by slug (Public)
router.get("/:slug", serviceControllers.getServiceBySlug);

// PATCH: /api/v1/services/:slug - Update service by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateServiceZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  serviceControllers.updateService,
);

// DELETE: /api/v1/services/:slug - Delete service by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  serviceControllers.deleteService,
);

export const speedRoutes = router;
