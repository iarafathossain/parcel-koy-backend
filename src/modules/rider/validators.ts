import * as zod from "zod";

export const updateRiderProfileZodSchema = zod
  .object({
    riderId: zod.uuid("Rider ID must be a valid UUID").optional(),
    presentAddress: zod
      .string()
      .min(1, "Present address cannot be empty")
      .optional(),
    permanentAddress: zod
      .string()
      .min(1, "Permanent address cannot be empty")
      .optional(),
    age: zod.int().min(18, "Rider age must be at least 18").optional(),
  })
  .refine(
    (data) =>
      data.presentAddress !== undefined ||
      data.permanentAddress !== undefined ||
      data.age !== undefined,
    {
      message:
        "At least one field is required: presentAddress, permanentAddress, or age",
    },
  );

export const updateRiderHubZodSchema = zod.object({
  hubId: zod.uuid("Hub ID must be a valid UUID"),
});

export const getSingleRiderByEmailZodSchema = zod.object({
  email: zod.email("Invalid email address"),
});

export type UpdateRiderProfilePayload = zod.infer<
  typeof updateRiderProfileZodSchema
>;
export type UpdateRiderHubPayload = zod.infer<typeof updateRiderHubZodSchema>;
export type GetSingleRiderByEmailPayload = zod.infer<
  typeof getSingleRiderByEmailZodSchema
>;
