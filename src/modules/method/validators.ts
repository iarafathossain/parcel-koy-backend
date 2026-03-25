import * as zod from "zod";
import { MethodType } from "../../generated/prisma/enums";

export const createMethodZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Method name is required")
    .min(3, "Method name must be at least 3 characters long"),
  type: zod.enum(
    [MethodType.PICKUP, MethodType.DELIVERY],
    "Invalid method type",
  ),
  description: zod.string().optional().nullable(),
  baseFee: zod
    .number("Base fee must be a number")
    .min(0, "Base fee must be greater than or equal to 0")
    .optional(),
  isActive: zod.boolean().optional(),
});

export type CreateMethodPayload = zod.infer<typeof createMethodZodSchema>;

export const updateMethodZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Method name must be at least 3 characters long")
    .optional(),
  type: zod
    .enum([MethodType.PICKUP, MethodType.DELIVERY], "Invalid method type")
    .optional(),
  description: zod.string().optional().nullable(),
  baseFee: zod
    .number("Base fee must be a number")
    .min(0, "Base fee must be greater than or equal to 0")
    .optional(),
  isActive: zod.boolean().optional(),
});

export type UpdateMethodPayload = zod.infer<typeof updateMethodZodSchema>;
