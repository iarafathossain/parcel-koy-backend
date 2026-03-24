import { Router } from "express";
import { adminRoutes } from "../modules/admin/routes";
import { areaRoutes } from "../modules/area/routes";
import { authRoutes } from "../modules/auth/routes";
import { categoryRoutes } from "../modules/category/routes";
import { hubRoutes } from "../modules/hub/routes";
import { merchantRoutes } from "../modules/merchant/routes";
import { methodRoutes } from "../modules/method/routes";
import { noteRoutes } from "../modules/note/routes";
import { parcelRoutes } from "../modules/parcel/routes";
import { pricingRoutes } from "../modules/pricing/routes";
import { riderRoutes } from "../modules/rider/routes";
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

// using method routes
router.use("/methods", methodRoutes);

// using merchant routes
router.use("/merchants", merchantRoutes);

// using admin routes
router.use("/admins", adminRoutes);

// using pricing routes
router.use("/pricing", pricingRoutes);

// using zone routes
router.use("/zones", zoneRoutes);

// using parcel routes
router.use("/parcels", parcelRoutes);

// using note routes
router.use("/notes", noteRoutes);

// using rider routes
router.use("/riders", riderRoutes);

export const indexRoutes = router;
