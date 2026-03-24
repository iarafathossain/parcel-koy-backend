import * as zod from "zod";

export const createParcelZodSchema = zod.object({
  categoryId: zod.string().uuid("Invalid Category ID"),
  destinationAreaId: zod.string().uuid("Invalid Area ID"),
  originAreaId: zod.string().uuid("Invalid Area ID").optional(),
  speedId: zod.string().uuid("Invalid Speed ID"),
  methodId: zod.string().uuid("Invalid Method ID"),
  pickupRiderId: zod.string().uuid("Invalid Pickup Rider ID").optional(),
  deliveryRiderId: zod.string().uuid("Invalid Delivery Rider ID").optional(),
  originHubId: zod.string().uuid("Invalid Origin Hub ID").optional(),
  destinationHubId: zod.string().uuid("Invalid Destination Hub ID").optional(),
  declaredWeight: zod
    .number()
    .positive("Declared weight must be a positive number"),
  isFragile: zod.boolean().optional(),
  pickupAddress: zod.string().min(1, "Pickup address is required").optional(),
  deliveryAddress: zod.string().min(1, "Delivery address is required"),
  receiverName: zod.string().min(1, "Receiver name is required"),
  receiverContactNumber: zod
    .string()
    .min(1, "Receiver contact number is required"),
  codAmount: zod.number().nonnegative("COD amount must be non-negative"),
});

export const updateParcelZodSchema = zod.object({
  categoryId: zod.string().uuid("Invalid Category ID").optional(),
  destinationAreaId: zod.string().uuid("Invalid Area ID").optional(),
  originAreaId: zod.string().uuid("Invalid Area ID").optional(),
  speedId: zod.string().uuid("Invalid Speed ID").optional(),
  methodId: zod.string().uuid("Invalid Method ID").optional(),
  declaredWeight: zod
    .number()
    .positive("Declared weight must be a positive number")
    .optional(),
  isFragile: zod.boolean().optional(),
  pickupAddress: zod.string().min(1, "Pickup address is required").optional(),
  deliveryAddress: zod
    .string()
    .min(1, "Delivery address is required")
    .optional(),
  receiverName: zod.string().min(1, "Receiver name is required").optional(),
  receiverContactNumber: zod
    .string()
    .min(1, "Receiver contact number is required")
    .optional(),
  deliveryCharge: zod
    .number()
    .nonnegative("Delivery charge must be non-negative")
    .optional(),
});

export const updateParcelStatusByAdminZodSchema = zod.object({
  status: zod.enum(
    [
      "REQUESTED",
      "PICKUP_RIDER_ASSIGNED",
      "PICKED_UP",
      "PICKUP_FAILED",
      "RECEIVED_AT_ORIGIN_HUB",
      "IN_TRANSIT",
      "RECEIVED_AT_DESTINATION_HUB",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "PARTIAL_DELIVERY",
      "DELIVERY_FAILED",
      "ON_HOLD",
      "RETURNED_TO_MERCHANT",
      "CANCELLED",
    ],
    "Invalid parcel status selected",
  ),
  pickupRiderId: zod.string().uuid("Invalid Pickup Rider ID").optional(),
  deliveryRiderId: zod.string().uuid("Invalid Delivery Rider ID").optional(),
});

export const cancelParcelByMerchantZodSchema = zod.object({
  cancellationReason: zod
    .string()
    .min(1, "Cancellation reason is required")
    .optional(),
});

export const updateParcelStatusByRiderZodSchema = zod.object({
  status: zod.enum(
    ["PICKED_UP", "PICKUP_FAILED", "DELIVERY_FAILED"],
    "Invalid parcel status selected",
  ),
  pickupFailedReason: zod
    .string()
    .min(1, "Pickup failed reason is required")
    .optional(),
  deliveryFailedReason: zod
    .string()
    .min(1, "Delivery failed reason is required")
    .optional(),
});

export const verifyAndDeliverParcelZodSchema = zod.object({
  otp: zod.string().min(1, "OTP is required"),
});

export type CreateParcelPayload = zod.infer<typeof createParcelZodSchema>;
export type UpdateParcelPayload = zod.infer<typeof updateParcelZodSchema>;
export type UpdateParcelStatusByAdminPayload = zod.infer<
  typeof updateParcelStatusByAdminZodSchema
>;
export type CancelParcelByMerchantPayload = zod.infer<
  typeof cancelParcelByMerchantZodSchema
>;
export type UpdateParcelStatusByRiderPayload = zod.infer<
  typeof updateParcelStatusByRiderZodSchema
>;
export type VerifyAndDeliverParcelPayload = zod.infer<
  typeof verifyAndDeliverParcelZodSchema
>;
