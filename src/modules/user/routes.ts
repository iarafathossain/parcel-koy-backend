import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { userController } from "./controllers.js";
import { createAdminZodSchema, createRiderZodSchema } from "./validators.js";

const router = Router();

// POST: /api/v1/users/create-admin - create admin (super admin & admin only)
router.post(
  "/create-admin",
  validateRequest(createAdminZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.createAdmin,
);

// POST: /api/v1/users/create-rider - create rider (super admin & admin only)
router.post(
  "/create-rider",
  validateRequest(createRiderZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.createRider,
);

export const userRoutes = router;
