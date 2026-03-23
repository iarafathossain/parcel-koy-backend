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
  actualWeight: zod
    .number()
    .positive("Actual weight must be a positive number")
    .optional(),
  isFragile: zod.boolean().optional(),
  note: zod.string().optional(),
  noteById: zod.string().uuid("Invalid User ID").optional(),
  noteCreatedAt: zod.string().optional(),

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
  actualWeight: zod
    .number()
    .positive("Actual weight must be a positive number")
    .optional(),
  isFragile: zod.boolean().optional(),
  note: zod.string().optional(),
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

export type CreateParcelPayload = zod.infer<typeof createParcelZodSchema>;
export type UpdateParcelPayload = zod.infer<typeof updateParcelZodSchema>;
