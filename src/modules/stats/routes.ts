import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { StatsController } from "./controllers";

const router = Router();

// GET /stats - Get dashboard stats (access = super admin, admin, merchant, rider)
router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.MERCHANT, Role.RIDER),
  StatsController.getDashboardStats,
);

export const statsRoute = router;
