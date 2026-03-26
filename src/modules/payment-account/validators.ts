import * as zod from "zod";

export const stripeConnectOnboardingZodSchema = zod.object({
  successReturnUrl: zod.string().url("Must be a valid URL"),
  refreshUrl: zod.string().url("Must be a valid URL"),
});

export const verifyStripeConnectZodSchema = zod.object({
  accountId: zod
    .string()
    .startsWith("acct_", { message: "Invalid Stripe Account ID" }),
});
