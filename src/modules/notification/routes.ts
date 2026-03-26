import express from "express";
import { Role } from "../generated/prisma/enums";
import { checkAuth } from "../middlewares/check-auth";
import { notificationControllers } from "./controllers";
const router = express.Router();

// GET: /api/v1/notifications/ -> Get all notifications for the logged-in user
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER),
  notificationControllers.getMyNotifications,
);

// PATCH: /api/v1/notifications/read-all -> Mark all notifications as read
router.patch(
  "/read-all",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER),
  notificationControllers.markAllAsRead,
);

// PATCH: /api/v1/notifications/:id/read -> Mark a specific notification as read
router.patch(
  "/:id/read",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER),
  notificationControllers.markAsRead,
);

export const notificationRoutes = router;
