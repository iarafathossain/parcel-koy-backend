import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { categoryControllers } from "./controllers.js";
import { createCategoryZodSchema, updateCategoryZodSchema } from "./validators.js";

const router = Router();

// POST: /api/v1/categories/ - Create a new category (Admin & Super Admin)
router.post(
  "/",
  validateRequest(createCategoryZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  categoryControllers.createCategory,
);

// GET: /api/v1/categories/ - Get all categories (Public)
router.get("/", categoryControllers.getAllCategories);

// GET: /api/v1/categories/:slug - Get category by slug (Public)
router.get("/:slug", categoryControllers.getCategoryBySlug);

// PATCH: /api/v1/categories/:slug - Update category by slug (Admin & Super Admin)
router.patch(
  "/:slug",
  validateRequest(updateCategoryZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  categoryControllers.updateCategory,
);

// DELETE: /api/v1/categories/:slug - Delete category by slug (Admin & Super Admin)
router.delete(
  "/:slug",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  categoryControllers.deleteCategory,
);

export const categoryRoutes = router;
