import * as zod from "zod";

export const createServiceZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Service name is required")
    .min(3, "Service name must be at least 3 characters long"),
  description: zod.string().optional().nullable(),
  baseFee: zod
    .number("Base fee must be a number")
    .min(0, "Base fee must be greater than or equal to 0")
    .optional(),
  slaHours: zod
    .number("SLA hours must be a number")
    .int("SLA hours must be an integer")
    .positive("SLA hours must be greater than 0"),
  isActive: zod.boolean("isActive must be a boolean").optional(),
});

export type CreateServicePayload = zod.infer<typeof createServiceZodSchema>;

export const updateServiceZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Service name must be at least 3 characters long")
    .optional(),
  description: zod.string().optional().nullable(),
  baseFee: zod
    .number("Base fee must be a number")
    .min(0, "Base fee must be greater than or equal to 0")
    .optional(),
  slaHours: zod
    .number("SLA hours must be a number")
    .int("SLA hours must be an integer")
    .positive("SLA hours must be greater than 0")
    .optional(),
  isActive: zod.boolean("isActive must be a boolean").optional(),
});

export type UpdateServicePayload = zod.infer<typeof updateServiceZodSchema>;
