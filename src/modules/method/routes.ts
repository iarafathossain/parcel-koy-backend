import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { methodControllers } from "./controllers.js";
import { createMethodZodSchema, updateMethodZodSchema } from "./validators.js";

const router = Router();

// POST: /api/v1/methods/ - Create a new method (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createMethodZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  methodControllers.createMethod,
);

// GET: /api/v1/methods/ - Get all methods (Public)
router.get("/", methodControllers.getAllMethods);

// GET: /api/v1/methods/:slug - Get method by slug (Public)
router.get("/:slug", methodControllers.getMethodBySlug);

// PATCH: /api/v1/methods/:slug - Update method by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateMethodZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  methodControllers.updateMethod,
);

// DELETE: /api/v1/methods/:slug - Delete method by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  methodControllers.deleteMethod,
);

export const methodRoutes = router;
