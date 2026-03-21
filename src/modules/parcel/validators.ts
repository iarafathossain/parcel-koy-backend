import * as zod from "zod";

export const createParcelZodSchema = zod.object({
  trackingId: zod.string().min(1, "Tracking ID is required"),
  qrCodeUrl: zod.string().url().optional(),
  merchantId: zod.string().uuid("Invalid Merchant ID"),
  categoryId: zod.string().uuid("Invalid Category ID"),
  areaId: zod.string().uuid("Invalid Area ID"),
  speedId: zod.string().uuid("Invalid Speed ID"),
  methodId: zod.string().uuid("Invalid Method ID"),
  pickupRiderId: zod.string().uuid("Invalid Pickup Rider ID").optional(),
  deliveryRiderId: zod.string().uuid("Invalid Delivery Rider ID").optional(),
  originHubId: zod.string().uuid("Invalid Origin Hub ID").optional(),
  destinationHubId: zod.string().uuid("Invalid Destination Hub ID").optional(),
  weight: zod.number().positive("Weight must be a positive number"),
  isFragile: zod.boolean().optional(),
  notes: zod.string().optional(),
  pickupAddress: zod.string().min(1, "Pickup address is required"),
  deliveryAddress: zod.string().min(1, "Delivery address is required"),
  receiverName: zod.string().min(1, "Receiver name is required"),
  receiverContactNumber: zod
    .string()
    .min(1, "Receiver contact number is required"),
  codAmount: zod.number().nonnegative("COD amount must be non-negative"),
  deliveryCharge: zod
    .number()
    .nonnegative("Delivery charge must be non-negative"),
  deliveryOtp: zod
    .string()
    .length(6, "Delivery OTP must be 6 characters")
    .optional(),
});
