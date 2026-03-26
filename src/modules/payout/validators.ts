import * as zod from "zod";

export const createStripeCheckoutSessionZodSchema = zod.object({
  successUrl: zod.url("successUrl must be a valid URL").optional(),
  cancelUrl: zod.url("cancelUrl must be a valid URL").optional(),
});

export const requestPayoutZodSchema = zod.object({
  amount: zod.number().positive("Amount must be greater than zero"),
});

export type CreateStripeCheckoutSessionPayload = zod.infer<
  typeof createStripeCheckoutSessionZodSchema
>;

export type RequestPayoutPayload = zod.infer<typeof requestPayoutZodSchema>;
