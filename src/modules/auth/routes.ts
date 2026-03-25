import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/check-auth";
import { validateRequest } from "../../middlewares/validate-request";
import { authControllers } from "./controllers";
import {
  changePasswordZodSchema,
  forgotPasswordZodSchema,
  loginUserZodSchema,
  registerMerchantZodSchema,
  resetPasswordZodSchema,
  verifyEmailZodSchema,
} from "./validators";

const router = Router();

// POST: api/v1/auth/register (register a new merchant)
router.post(
  "/register",
  validateRequest(registerMerchantZodSchema),
  authControllers.registerMerchant,
);

// POST: api/v1/auth/verify-email (verify email with OTP)
router.post(
  "/verify-email",
  validateRequest(verifyEmailZodSchema),
  authControllers.verifyEmail,
);

// POST: api/v1/auth/login (login a user)
router.post(
  "/login",
  validateRequest(loginUserZodSchema),
  authControllers.loginUser,
);

// GET: api/v1/auth/me (get current logged in user)
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER, Role.SUPER_ADMIN),
  authControllers.getMe,
);

// GET: api/v1/auth/refresh-tokens (get new access and refresh tokens)
router.get(
  "/refresh-tokens",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER, Role.SUPER_ADMIN),
  authControllers.getNewTokens,
);

// POST: api/v1/auth/logout (logout a user)
router.post(
  "/logout",
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER, Role.SUPER_ADMIN),
  authControllers.logout,
);

// POST: api/v1/auth/change-password (change password for logged in user)
router.post(
  "/change-password",
  validateRequest(changePasswordZodSchema),
  checkAuth(Role.ADMIN, Role.MERCHANT, Role.RIDER, Role.SUPER_ADMIN),
  authControllers.changePassword,
);

// POST: api/v1/auth/forget-password (initiate password reset)
router.post(
  "/forget-password",
  validateRequest(forgotPasswordZodSchema),
  authControllers.forgetPassword,
);

// POST: api/v1/auth/reset-password (reset password with token)
router.post(
  "/reset-password",
  validateRequest(resetPasswordZodSchema),
  authControllers.resetPassword,
);

export const authRoutes = router;
