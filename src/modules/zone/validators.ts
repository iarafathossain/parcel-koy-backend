import * as zod from "zod";

export const createZoneZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Zone name is required")
    .min(3, "Zone name must be at least 3 characters long"),
  isActive: zod.boolean().optional(),
  isInsideDhaka: zod.boolean(),
});

export type CreateZonePayload = zod.infer<typeof createZoneZodSchema>;

export const updateZoneZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Zone name must be at least 3 characters long")
    .optional(),
  isActive: zod.boolean().optional(),
  isInsideDhaka: zod.boolean().optional(),
});

export type UpdateZonePayload = zod.infer<typeof updateZoneZodSchema>;
