import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { parcelControllers } from "./controllers";
import { createParcelZodSchema, updateParcelZodSchema } from "./validators";

const router = Router();

// POST: /api/v1/parcels/ - Create a new parcel (Merchant only)
router.post(
  "/",
  validateRequest(createParcelZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.createParcel,
);

//TODO: test this route
// PUT: /api/v1/parcels/:id - Update an existing parcel (Merchant only)
router.put(
  "/:id",
  validateRequest(updateParcelZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.updateParcel,
);
export const parcelRoutes = router;
