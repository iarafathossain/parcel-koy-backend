import { Router } from "express";
import { authRoutes } from "../modules/auth/routes";
import { userRoutes } from "../modules/user/routes";
import { zoneRoutes } from "../modules/zone/routes";
const router = Router();

// using auth routes
router.use("/auth", authRoutes);

// using user routes
router.use("/users", userRoutes);

// using zone routes
router.use("/zones", zoneRoutes);

export const indexRoutes = router;
