import * as zod from "zod";

export const createPricingZodSchema = zod
  .object({
    originalZoneId: zod.uuid("Original zone ID must be a valid UUID"),
    destinationZoneId: zod.uuid("Destination zone ID must be a valid UUID"),
    categoryId: zod.uuid("Category ID must be a valid UUID"),
    speedId: zod.uuid("Speed ID must be a valid UUID"),
    pickupMethodId: zod.uuid("Pickup method ID must be a valid UUID"),
    deliveryMethodId: zod.uuid("Delivery method ID must be a valid UUID"),
    minWeight: zod
      .number("Min weight must be a number")
      .min(0, "Min weight must be greater than or equal to 0"),
    maxWeight: zod
      .number("Max weight must be a number")
      .positive("Max weight must be greater than 0"),
    price: zod
      .number("Price must be a number")
      .min(0, "Price must be greater than or equal to 0"),
    isActive: zod.boolean().optional(),
  })
  .refine((data) => data.minWeight < data.maxWeight, {
    message: "Min weight must be less than max weight",
    path: ["minWeight"],
  });

export type CreatePricingRulePayload = zod.infer<typeof createPricingZodSchema>;

export const updatePricingZodSchema = zod
  .object({
    originalZoneId: zod
      .uuid("Original zone ID must be a valid UUID")
      .optional(),
    destinationZoneId: zod
      .uuid("Destination zone ID must be a valid UUID")
      .optional(),
    categoryId: zod
      .uuid("Category ID must be a valid UUID")
      .optional()
      .nullable(),
    speedId: zod.uuid("Speed ID must be a valid UUID").optional(),
    pickupMethodId: zod
      .uuid("Pickup method ID must be a valid UUID")
      .optional(),
    deliveryMethodId: zod
      .uuid("Delivery method ID must be a valid UUID")
      .optional(),
    minWeight: zod
      .number("Min weight must be a number")
      .min(0, "Min weight must be greater than or equal to 0")
      .optional(),
    maxWeight: zod
      .number("Max weight must be a number")
      .positive("Max weight must be greater than 0")
      .optional(),
    price: zod
      .number("Price must be a number")
      .min(0, "Price must be greater than or equal to 0")
      .optional(),
    isActive: zod.boolean().optional(),
  })
  .refine(
    (data) => {
      // Only validate if both weights are provided
      if (data.minWeight !== undefined && data.maxWeight !== undefined) {
        return data.minWeight < data.maxWeight;
      }
      return true;
    },
    {
      message: "Min weight must be less than max weight",
      path: ["minWeight"],
    },
  );

export type UpdatePricingRulePayload = zod.infer<typeof updatePricingZodSchema>;
