import { Router } from "express";
import { areaRoutes } from "../modules/area/routes";
import { authRoutes } from "../modules/auth/routes";
import { hubRoutes } from "../modules/hub/routes";
import { userRoutes } from "../modules/user/routes";
import { zoneRoutes } from "../modules/zone/routes";
const router = Router();

// using auth routes
router.use("/auth", authRoutes);

// using user routes
router.use("/users", userRoutes);

// using area routes
router.use("/areas", areaRoutes);

// using hub routes
router.use("/hubs", hubRoutes);

// using zone routes
router.use("/zones", zoneRoutes);

export const indexRoutes = router;
