import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { parcelControllers } from "./controllers";
import {
  cancelParcelByMerchantZodSchema,
  createParcelZodSchema,
  updateParcelStatusByAdminZodSchema,
  updateParcelStatusByRiderZodSchema,
  updateParcelZodSchema,
  verifyAndDeliverParcelZodSchema,
} from "./validators";

const router = Router();

// POST: /api/v1/parcels/ - Create a new parcel (Merchant only)
router.post(
  "/",
  validateRequest(createParcelZodSchema),
  checkAuth(Role.MERCHANT),
  parcelControllers.createParcel,
);

// PUT: /api/v1/parcels/:id - Update an existing parcel (Merchant only)
router.put(
  "/:id",
  validateRequest(updateParcelZodSchema),
  checkAuth(Role.MERCHANT),
  parcelControllers.updateParcel,
);

// PATCH: /api/v1/parcels/status/:id - Update parcel status (Admin only)
router.patch(
  "/status/:id",
  validateRequest(updateParcelStatusByAdminZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  parcelControllers.updateParcelStatusByAdmin,
);

// PATCH: /api/v1/parcels/cancel/:id - Cancel a parcel (Merchant only)
router.patch(
  "/cancel/:id",
  validateRequest(cancelParcelByMerchantZodSchema),
  checkAuth(Role.MERCHANT),
  parcelControllers.cancelParcelByMerchant,
);

// PATCH: /api/v1/parcels/rider-status/:id - Update parcel status (Rider only)
router.patch(
  "/rider-status/:id",
  validateRequest(updateParcelStatusByRiderZodSchema),
  checkAuth(Role.RIDER),
  parcelControllers.updateParcelStatusByRider,
);

// POST: /api/v1/parcels/delivery-otp/:id - Send delivery OTP (Rider only)
router.post(
  "/delivery-otp/:id",
  checkAuth(Role.RIDER),
  parcelControllers.sendDeliveryOTP,
);

// PATCH: /api/v1/parcels/verify-delivery/:id - Verify OTP and deliver parcel (Rider only)
router.patch(
  "/verify-delivery/:id",
  validateRequest(verifyAndDeliverParcelZodSchema),
  checkAuth(Role.RIDER),
  parcelControllers.verifyAndDeliverParcel,
);

// GET: /api/v1/parcels/tracking/:trackingId - Get parcel hub tracking details (public route)
router.get("/tracking/:trackingId", parcelControllers.getParcelHubTracking);

export const parcelRoutes = router;
