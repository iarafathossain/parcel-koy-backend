import * as zod from "zod";

export const createStripeCheckoutSessionZodSchema = zod.object({
  successUrl: zod.url("successUrl must be a valid URL").optional(),
  cancelUrl: zod.url("cancelUrl must be a valid URL").optional(),
});

export type CreateStripeCheckoutSessionPayload = zod.infer<
  typeof createStripeCheckoutSessionZodSchema
>;
