import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { parcelControllers } from "./controllers";
import { createParcelZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/parcels/ - Create a new parcel (Merchant only)
router.post(
  "/",
  validateRequest(createParcelZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.createParcel,
);

export const parcelRoutes = router;
