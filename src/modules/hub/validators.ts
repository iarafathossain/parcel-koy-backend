import * as zod from "zod";

export const createHubZodSchema = zod.object({
  name: zod
    .string()
    .min(1, "Hub name is required")
    .min(3, "Hub name must be at least 3 characters long"),
  address: zod
    .string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters long"),
  contactNumber: zod
    .string()
    .min(11, "Contact number must be at least 11 characters long")
    .max(11, "Contact number must be at most 11 characters long")
    .regex(/^[0-9]+$/, "Contact number must contain only digits"),
  areaId: zod.uuid("Area ID must be a valid UUID"),
  managerId: zod.uuid("Manager ID must be a valid UUID").optional().nullable(),
});

export type CreateHubPayload = zod.infer<typeof createHubZodSchema>;

export const updateHubZodSchema = zod.object({
  name: zod
    .string()
    .min(3, "Hub name must be at least 3 characters long")
    .optional(),
  address: zod
    .string()
    .min(5, "Address must be at least 5 characters long")
    .optional(),
  contactNumber: zod
    .string()
    .min(11, "Contact number must be at least 11 characters long")
    .max(11, "Contact number must be at most 11 characters long")
    .regex(/^[0-9]+$/, "Contact number must contain only digits")
    .optional(),
  areaId: zod.uuid("Area ID must be a valid UUID").optional(),
  managerId: zod.uuid("Manager ID must be a valid UUID").optional().nullable(),
});

export type UpdateHubPayload = zod.infer<typeof updateHubZodSchema>;
