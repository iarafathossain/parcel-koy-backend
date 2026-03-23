import { Router } from "express";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { parcelControllers } from "./controllers";
import {
  cancelParcelByMerchantZodSchema,
  createParcelZodSchema,
  updateParcelStatusByAdminZodSchema,
  updateParcelStatusByRiderZodSchema,
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

// PATCH: /api/v1/parcels/cancel/:id - Cancel a parcel (Merchant only)
router.patch(
  "/cancel/:id",
  validateRequest(cancelParcelByMerchantZodSchema),
  checkAuth("MERCHANT"),
  parcelControllers.cancelParcelByMerchant,
);

// PATCH: /api/v1/parcels/rider-status/:id - Update parcel status (Rider only)
router.patch(
  "/rider-status/:id",
  validateRequest(updateParcelStatusByRiderZodSchema),
  checkAuth("RIDER"),
  parcelControllers.updateParcelStatusByRider,
);

export const parcelRoutes = router;
