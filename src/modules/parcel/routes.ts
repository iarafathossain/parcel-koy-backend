import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { parcelControllers } from "./controllers";
import {
  createParcelZodSchema,
  updateParcelStatusByAdminZodSchema,
  updateParcelZodSchema,
} from "./validators";

const router = Router();

// POST: /api/v1/parcels/ - Create a new parcel (Merchant only)
router.post(
  "/",
  validateRequest(createParcelZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.createParcel,
);

// PUT: /api/v1/parcels/:id - Update an existing parcel (Merchant only)
router.put(
  "/:id",
  validateRequest(updateParcelZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.updateParcel,
);

// PATCH: /api/v1/parcels/status/:id - Update parcel status (Admin only)
router.patch(
  "/status/:id",
  validateRequest(updateParcelStatusByAdminZodSchema),
  checkAuth("ADMIN", "SUPER_ADMIN"),
  parcelControllers.updateParcelStatusByAdmin,
);

export const parcelRoutes = router;
