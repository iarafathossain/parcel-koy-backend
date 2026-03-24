import * as zod from "zod";

export const updateMerchantProfileZodSchema = zod
  .object({
    merchantId: zod.uuid("Merchant ID must be a valid UUID").optional(),
    businessName: zod
      .string()
      .min(1, "Business name cannot be empty")
      .optional(),
    pickupAddress: zod
      .string()
      .min(1, "Pickup address cannot be empty")
      .optional(),
    originAreaId: zod.uuid("Origin Area ID must be a valid UUID").optional(),
  })
  .refine(
    (data) =>
      data.businessName !== undefined ||
      data.pickupAddress !== undefined ||
      data.originAreaId !== undefined,
    {
      message:
        "At least one field is required: businessName, pickupAddress, or originAreaId",
    },
  );

export const getSingleMerchantByEmailZodSchema = zod.object({
  email: zod.email("Invalid email address"),
});

export type UpdateMerchantProfilePayload = zod.infer<
  typeof updateMerchantProfileZodSchema
>;
export type GetSingleMerchantByEmailPayload = zod.infer<
  typeof getSingleMerchantByEmailZodSchema
>;
