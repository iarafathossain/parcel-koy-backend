import * as zod from "zod";

export const registerMerchantZodSchema = zod
  .object({
    name: zod
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be at most 100 characters long"),
    email: zod.email("Invalid email address"),
    password: zod
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .max(50, "Password must be at most 50 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character (@, $, !, %, *, ?, &)",
      ),
    confirmPassword: zod.string().min(1, "Confirm password is required"),
    businessName: zod
      .string()
      .min(1, "Business name is required")
      .max(100, "Business name must be at most 100 characters long"),
    contactNumber: zod
      .string()
      .min(11, "Contact number must be at least 11 characters long")
      .max(11, "Contact number must be at most 11 characters long")
      .regex(/^[0-9]+$/, "Contact number must contain only digits"),
    pickupAddress: zod
      .string()
      .min(1, "Pickup address is required")
      .max(200, "Pickup address must be at most 200 characters long"),
    originAreaId: zod.string().uuid("Invalid Origin Area ID"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password must match password",
    path: ["confirmPassword"],
  });

export type RegisterMerchantZodSchema = zod.infer<
  typeof registerMerchantZodSchema
>;

export const verifyEmailZodSchema = zod.object({
  email: zod.email("Invalid email address"),
  otp: zod
    .string()
    .min(1, "OTP is required")
    .max(6, "OTP must be at most 6 characters long"),
});

export type VerifyEmailZodSchema = zod.infer<typeof verifyEmailZodSchema>;

export const loginUserZodSchema = zod.object({
  email: zod.email("Invalid email address"),
  password: zod.string().min(1, "Password is required"),
});

export type LoginUserZodSchema = zod.infer<typeof loginUserZodSchema>;

export const changePasswordZodSchema = zod.object({
  currentPassword: zod.string().min(1, "Current password is required"),
  newPassword: zod
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters long")
    .max(50, "New password must be at most 50 characters long")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "New password must contain at least one special character (@, $, !, %, *, ?, &)",
    ),
});
export type ChangePasswordZodSchema = zod.infer<typeof changePasswordZodSchema>;

export const forgotPasswordZodSchema = zod.object({
  email: zod.email("Invalid email address"),
});
export type ForgotPasswordZodSchema = zod.infer<typeof forgotPasswordZodSchema>;

export const resetPasswordZodSchema = zod.object({
  email: zod.email("Invalid email address"),
  otp: zod
    .string()
    .min(1, "OTP is required")
    .max(6, "OTP must be at most 6 characters long"),
  newPassword: zod
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters long")
    .max(50, "New password must be at most 50 characters long")
    .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
    .regex(/[a-z]/, "New password must contain at least one lowercase letter")
    .regex(/[0-9]/, "New password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "New password must contain at least one special character (@, $, !, %, *, ?, &)",
    ),
});

export type ResetPasswordZodSchema = zod.infer<typeof resetPasswordZodSchema>;

export const activateUserZodSchema = zod.object({
  userId: zod.uuid("User ID must be a valid UUID"),
});

export type ActivateUserPayload = zod.infer<typeof activateUserZodSchema>;

export const blockUserZodSchema = zod.object({
  userId: zod.uuid("User ID must be a valid UUID"),
});

export type BlockUserPayload = zod.infer<typeof blockUserZodSchema>;
