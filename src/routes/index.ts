import { Router } from "express";
import { areaRoutes } from "../modules/area/routes";
import { authRoutes } from "../modules/auth/routes";
import { categoryRoutes } from "../modules/category/routes";
import { hubRoutes } from "../modules/hub/routes";
import { pricingRoutes } from "../modules/pricing/routes";
import { speedRoutes } from "../modules/speed/routes";
import { userRoutes } from "../modules/user/routes";
import { zoneRoutes } from "../modules/zone/routes";
const router = Router();

// using auth routes
router.use("/auth", authRoutes);

// using user routes
router.use("/users", userRoutes);

// using area routes
router.use("/areas", areaRoutes);

// using category routes
router.use("/categories", categoryRoutes);

// using hub routes
router.use("/hubs", hubRoutes);

// using speed routes
router.use("/speeds", speedRoutes);

// using pricing routes
router.use("/pricing", pricingRoutes);

// using zone routes
router.use("/zones", zoneRoutes);

export const indexRoutes = router;
