import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { adminControllers } from "./controllers";
import {
    deleteUserZodSchema,
    getSingleAdminByEmailZodSchema,
    updateAdminProfileZodSchema,
} from "./validators";

const router = Router();

// PATCH: /api/v1/admins/profile - Update admin profile (Admin, Super Admin)
router.patch(
  "/profile",
  validateRequest(updateAdminProfileZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.updateAdminProfile,
);

// DELETE: /api/v1/admins/:id - Soft delete admin (Admin, Super Admin)
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.softDeleteAdmin,
);

// GET: /api/v1/admins - Get all admins (Admin, Super Admin)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getAllAdmins,
);

// POST: /api/v1/admins/by-email - Get admin by email (Admin, Super Admin)
router.post(
  "/by-email",
  validateRequest(getSingleAdminByEmailZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getSingleAdminByEmail,
);

// DELETE: /api/v1/admins/:id/permanent - Permanent delete admin (Admin, Super Admin)
router.delete(
  "/:id/permanent",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.deleteAdminById,
);

// POST: /api/v1/admins/delete - Delete user (Admin, Super Admin)
router.post(
  "/delete",
  validateRequest(deleteUserZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.deleteUser,
);

// GET: /api/v1/admins/:id - Get single admin by id (Admin, Super Admin)
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  adminControllers.getSingleAdminById,
);

export const adminRoutes = router;
