import * as zod from "zod";

export const createCategoryZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Category name is required")
    .min(3, "Category name must be at least 3 characters long"),
  baseWeight: zod
    .number("Base weight must be a number")
    .positive("Base weight must be greater than 0"),
  baseFee: zod
    .number("Base fee must be a number")
    .nonnegative("Base fee must be greater than or equal to 0")
    .optional(),
  isActive: zod.boolean().optional(),
});

export type CreateCategoryPayload = zod.infer<typeof createCategoryZodSchema>;

export const updateCategoryZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Category name must be at least 3 characters long")
    .optional(),
  baseWeight: zod
    .number("Base weight must be a number")
    .positive("Base weight must be greater than 0")
    .optional(),
  baseFee: zod
    .number("Base fee must be a number")
    .nonnegative("Base fee must be greater than or equal to 0")
    .optional(),
  isActive: zod.boolean().optional(),
});

export type UpdateCategoryPayload = zod.infer<typeof updateCategoryZodSchema>;
