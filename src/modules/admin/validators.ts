import * as zod from "zod";

export const updateAdminProfileZodSchema = zod
  .object({
    adminId: zod.uuid("Admin ID must be a valid UUID").optional(),
    name: zod.string().min(1, "Name cannot be empty").optional(),
    image: zod.string().url("Invalid image URL").optional(),
    contactNumber: zod
      .string()
      .regex(/^[0-9]{10,15}$/, "Contact number must be 10-15 digits")
      .optional(),
    gender: zod.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    presentAddress: zod
      .string()
      .min(1, "Present address cannot be empty")
      .optional(),
    permanentAddress: zod
      .string()
      .min(1, "Permanent address cannot be empty")
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.image !== undefined ||
      data.contactNumber !== undefined ||
      data.gender !== undefined ||
      data.presentAddress !== undefined ||
      data.permanentAddress !== undefined,
    {
      message:
        "At least one field is required: name, image, contactNumber, gender, presentAddress, or permanentAddress",
    },
  );

export const getSingleAdminByEmailZodSchema = zod.object({
  email: zod.email("Invalid email address"),
});

export const activateUserZodSchema = zod.object({
  userId: zod.uuid("User ID must be a valid UUID"),
});

export const blockUserZodSchema = zod.object({
  userId: zod.uuid("User ID must be a valid UUID"),
});

export const deleteUserZodSchema = zod.object({
  userId: zod.uuid("User ID must be a valid UUID"),
});

export type UpdateAdminProfilePayload = zod.infer<
  typeof updateAdminProfileZodSchema
>;
export type GetSingleAdminByEmailPayload = zod.infer<
  typeof getSingleAdminByEmailZodSchema
>;
export type ActivateUserPayload = zod.infer<typeof activateUserZodSchema>;
export type BlockUserPayload = zod.infer<typeof blockUserZodSchema>;
export type DeleteUserPayload = zod.infer<typeof deleteUserZodSchema>;
