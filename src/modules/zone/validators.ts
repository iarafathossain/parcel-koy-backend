import * as zod from "zod";

export const createZoneZodSchema = zod.object({
  name: zod.string().min(1, "Zone name is required").min(3, "Zone name must be at least 3 characters long"),
});

export type CreateZonePayload = zod.infer<typeof createZoneZodSchema>;

export const updateZoneZodSchema = zod.object({
  name: zod.string().min(3, "Zone name must be at least 3 characters long").optional(),
});

export type UpdateZonePayload = zod.infer<typeof updateZoneZodSchema>;
