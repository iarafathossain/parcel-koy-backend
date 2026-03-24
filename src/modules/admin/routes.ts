import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { adminControllers } from "./controllers";
import {
  activateUserZodSchema,
  blockUserZodSchema,
  deleteUserZodSchema,
  getSingleAdminByEmailZodSchema,
  updateAdminProfileZodSchema,
} from "./validators";

const router = Router();

// PATCH: /api/v1/admins/profile - Update admin profile (Admin, Super Admin)
router.patch(
  "/profile",
  validateRequest(updateAdminProfileZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.updateAdminProfile,
);

// DELETE: /api/v1/admins/:id - Soft delete admin (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.softDeleteAdmin,
);

// GET: /api/v1/admins - Get all admins (Admin, Super Admin)
router.get(
  "/",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.getAllAdmins,
);

// POST: /api/v1/admins/by-email - Get admin by email (Admin, Super Admin)
router.post(
  "/by-email",
  validateRequest(getSingleAdminByEmailZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.getSingleAdminByEmail,
);

// DELETE: /api/v1/admins/:id/permanent - Permanent delete admin (Admin, Super Admin)
router.delete(
  "/:id/permanent",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.deleteAdminById,
);

// POST: /api/v1/admins/activate - Activate user (Admin, Super Admin)
router.post(
  "/users/activate",
  validateRequest(activateUserZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.activateUser,
);

// POST: /api/v1/admins/block - Block user (Admin, Super Admin)
router.post(
  "/users/block",
  validateRequest(blockUserZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.blockUser,
);

// POST: /api/v1/admins/delete - Delete user (Admin, Super Admin)
router.post(
  "/users/delete",
  validateRequest(deleteUserZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.deleteUser,
);

// GET: /api/v1/admins/:id - Get single admin by id (Admin, Super Admin)
router.get(
  "/:id",
  checkAuth("ADMIN", "SUPER_ADMIN"),
  adminControllers.getSingleAdminById,
);

export const adminRoutes = router;
