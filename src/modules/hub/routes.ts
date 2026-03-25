import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { hubControllers } from "./controllers";
import { createHubZodSchema, updateHubZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/hubs/ - Create a new hub (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createHubZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  hubControllers.createHub,
);

// GET: /api/v1/hubs/ - Get all hubs (Public)
router.get("/", hubControllers.getAllHubs);

// GET: /api/v1/hubs/:slug - Get hub by slug (Public)
router.get("/:slug", hubControllers.getHubBySlug);

// PATCH: /api/v1/hubs/:slug - Update hub by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateHubZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  hubControllers.updateHub,
);

// GET: /api/v1/hubs/:hubId/cash-collections?date=today - Get cash collections for a hub (Admin, Super Admin)
router.get(
  "/:hubId/cash-collections",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  hubControllers.getHubCashCollections,
);

// DELETE: /api/v1/hubs/:slug - Delete hub by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  hubControllers.deleteHub,
);

export const hubRoutes = router;
