import * as zod from "zod";
import { Gender } from "../../generated/prisma/enums";

export const updateMerchantProfileZodSchema = zod
  .object({
    merchantId: zod.uuid("Merchant ID must be a valid UUID").optional(),
    name: zod.string().min(1, "Name cannot be empty").optional(),
    image: zod.string().url("Invalid image URL").optional(),
    contactNumber: zod
      .string()
      .regex(/^[0-9]{10,15}$/, "Contact number must be 10-15 digits")
      .optional(),
    gender: zod.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
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
      data.name !== undefined ||
      data.image !== undefined ||
      data.contactNumber !== undefined ||
      data.gender !== undefined ||
      data.businessName !== undefined ||
      data.pickupAddress !== undefined ||
      data.originAreaId !== undefined,
    {
      message:
        "At least one field is required: name, image, contactNumber, gender, businessName, pickupAddress, or originAreaId",
    },
  );

export const getSingleMerchantByEmailZodSchema = zod.object({
  email: zod.email("Invalid email address"),
});

export const makePaymentRequestZodSchema = zod.object({
  amount: zod
    .number({
      error: "Amount must be a valid number",
    })
    .positive("Amount must be greater than 0"),
});

export type UpdateMerchantProfilePayload = zod.infer<
  typeof updateMerchantProfileZodSchema
>;
export type GetSingleMerchantByEmailPayload = zod.infer<
  typeof getSingleMerchantByEmailZodSchema
>;
export type MakePaymentRequestPayload = zod.infer<
  typeof makePaymentRequestZodSchema
>;
