import * as zod from "zod";

export const createAreaZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Area name is required")
    .min(3, "Area name must be at least 3 characters long"),
  zoneId: zod.uuid("Zone ID must be a valid UUID"),
});

export type CreateAreaPayload = zod.infer<typeof createAreaZodSchema>;

export const updateAreaZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Area name must be at least 3 characters long")
    .optional(),
  zoneId: zod.uuid("Zone ID must be a valid UUID").optional(),
});

export type UpdateAreaPayload = zod.infer<typeof updateAreaZodSchema>;
