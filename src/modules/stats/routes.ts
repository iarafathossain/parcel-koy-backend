import { Router } from "express";
import { Role } from "../../generated/prisma/enums.js";
import { checkAuth } from "../../middlewares/check-auth.js";
import { StatsController } from "./controllers.js";

const router = Router();

// GET /stats - Get dashboard stats (access = super admin, admin, merchant, rider)
router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.MERCHANT, Role.RIDER),
  StatsController.getDashboardStats,
);

export const statsRoute = router;
