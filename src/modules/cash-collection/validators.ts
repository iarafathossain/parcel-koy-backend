import * as zod from "zod";

export const collectCashZodSchema = zod.object({
  amount: zod.number().positive("Amount must be a positive number"),
});

export type CollectCashPayload = zod.infer<typeof collectCashZodSchema>;
