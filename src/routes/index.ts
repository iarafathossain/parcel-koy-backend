import { Router } from "express";
import { adminRoutes } from "../modules/admin/routes.js";
import { areaRoutes } from "../modules/area/routes.js";
import { authRoutes } from "../modules/auth/routes.js";
import { cashCollectionRoutes } from "../modules/cash-collection/routes.js";
import { categoryRoutes } from "../modules/category/routes.js";
import { hubRoutes } from "../modules/hub/routes.js";
import { merchantRoutes } from "../modules/merchant/routes.js";
import { methodRoutes } from "../modules/method/routes.js";
import { noteRoutes } from "../modules/note/routes.js";
import { parcelRoutes } from "../modules/parcel/routes.js";
import { paymentAccountRoutes } from "../modules/payment-account/routes.js";
import { payoutRoutes } from "../modules/payout/routes.js";
import { pricingRoutes } from "../modules/pricing/routes.js";
import { riderRoutes } from "../modules/rider/routes.js";
import { speedRoutes } from "../modules/speed/routes.js";
import { statsRoute } from "../modules/stats/routes.js";
import { userRoutes } from "../modules/user/routes.js";
import { zoneRoutes } from "../modules/zone/routes.js";
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

// using cash collection routes
router.use("/cash-collections", cashCollectionRoutes);

// using payment account routes
router.use("/payment-accounts", paymentAccountRoutes);

// using payout routes
router.use("/payouts", payoutRoutes);

// using stats routes
router.use("/stats", statsRoute);

export const indexRoutes = router;
