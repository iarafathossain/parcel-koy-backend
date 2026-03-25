import * as zod from "zod";

const paymentProviderTypes = [
  "BANK",
  "BKASH",
  "NAGAD",
  "ROCKET",
  "STRIPE",
] as const;
const paymentProviderTypeZodSchema = zod.enum(paymentProviderTypes);

export const addPaymentAccountZodSchema = zod
  .object({
    merchantId: zod.uuid("Merchant ID must be a valid UUID").optional(),
    providerType: paymentProviderTypeZodSchema,
    providerName: zod.string().min(1, "Provider name is required"),
    accountName: zod.string().min(1, "Account name is required"),
    accountNumber: zod.string().min(1, "Account number is required").optional(),
    branchName: zod.string().optional(),
    routingNumber: zod.string().optional(),
    stripeCustomerId: zod.string().optional(),
    stripePaymentMethodId: zod.string().optional(),
    stripePaymentMethodType: zod.string().optional(),
    cardBrand: zod.string().optional(),
    cardLast4: zod
      .string()
      .regex(/^\d{4}$/, "cardLast4 must be exactly 4 digits")
      .optional(),
    cardExpMonth: zod
      .number()
      .int("cardExpMonth must be an integer")
      .min(1)
      .max(12)
      .optional(),
    cardExpYear: zod
      .number()
      .int("cardExpYear must be an integer")
      .min(2024)
      .optional(),
    billingEmail: zod.email("Invalid billing email").optional(),
    isDefault: zod.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.providerType === "BANK") {
        return Boolean(data.branchName && data.routingNumber);
      }

      if (data.providerType === "STRIPE") {
        return Boolean(data.stripeCustomerId && data.stripePaymentMethodId);
      }

      return Boolean(data.accountNumber);
    },
    {
      message:
        "BANK requires branchName and routingNumber, STRIPE requires stripeCustomerId and stripePaymentMethodId, and non-STRIPE providers require accountNumber",
      path: ["providerType"],
    },
  );

export const updatePaymentAccountZodSchema = zod
  .object({
    providerType: paymentProviderTypeZodSchema.optional(),
    providerName: zod
      .string()
      .min(1, "Provider name cannot be empty")
      .optional(),
    accountName: zod.string().min(1, "Account name cannot be empty").optional(),
    accountNumber: zod
      .string()
      .min(1, "Account number cannot be empty")
      .optional(),
    branchName: zod.string().optional(),
    routingNumber: zod.string().optional(),
    stripeCustomerId: zod.string().optional(),
    stripePaymentMethodId: zod.string().optional(),
    stripePaymentMethodType: zod.string().optional(),
    cardBrand: zod.string().optional(),
    cardLast4: zod
      .string()
      .regex(/^\d{4}$/, "cardLast4 must be exactly 4 digits")
      .optional(),
    cardExpMonth: zod
      .number()
      .int("cardExpMonth must be an integer")
      .min(1)
      .max(12)
      .optional(),
    cardExpYear: zod
      .number()
      .int("cardExpYear must be an integer")
      .min(2024)
      .optional(),
    billingEmail: zod.email("Invalid billing email").optional(),
  })
  .refine(
    (data) =>
      data.providerType !== undefined ||
      data.providerName !== undefined ||
      data.accountName !== undefined ||
      data.accountNumber !== undefined ||
      data.branchName !== undefined ||
      data.routingNumber !== undefined ||
      data.stripeCustomerId !== undefined ||
      data.stripePaymentMethodId !== undefined ||
      data.stripePaymentMethodType !== undefined ||
      data.cardBrand !== undefined ||
      data.cardLast4 !== undefined ||
      data.cardExpMonth !== undefined ||
      data.cardExpYear !== undefined ||
      data.billingEmail !== undefined,
    {
      message: "At least one field is required for update",
    },
  );

export type AddPaymentAccountPayload = zod.infer<
  typeof addPaymentAccountZodSchema
>;
export type UpdatePaymentAccountPayload = zod.infer<
  typeof updatePaymentAccountZodSchema
>;
