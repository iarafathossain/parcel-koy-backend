import { Request, Response } from "express";
import status from "http-status";
import AppError from "../../errors/app-error";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-response";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { authServices } from "./services";
import { ForgotPasswordZodSchema } from "./validators";

const registerMerchant = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.registerMerchant(payload);

  // Set cookies only if a session was created.
  if (result.accessToken && result.refreshToken && result.sessionToken) {
    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionTokenCookie(res, result.sessionToken);
  }

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: result.requiresEmailVerification
      ? "Merchant registered. Please verify your email with OTP to complete login."
      : "Merchant registered successfully",
    requiredEmailVerification: result.requiresEmailVerification,
    data: result,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.verifyEmail(payload);

  if (result.accessToken && result.refreshToken && result.sessionToken) {
    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionTokenCookie(res, result.sessionToken);
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.status ? "Email verified successfully" : "Invalid OTP",
    data: result,
    requiredEmailVerification: false,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.loginUser(payload);

  // Set cookies only if a session was created.
  if (result.accessToken && result.refreshToken && result.sessionToken) {
    tokenUtils.setAccessTokenCookie(res, result.accessToken);
    tokenUtils.setRefreshTokenCookie(res, result.refreshToken);
    tokenUtils.setBetterAuthSessionTokenCookie(res, result.sessionToken);
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! No user information found in request",
    );
  }

  const result = await authServices.getMe(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result,
  });
});

const getNewTokens = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token is missing");
  }

  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session token is missing");
  }

  const { newRefreshToken, newSessionToken, newAccessToken } =
    await authServices.getNewTokens(refreshToken, sessionToken);

  tokenUtils.setAccessTokenCookie(res, newAccessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionTokenCookie(res, newSessionToken!);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tokens refreshed successfully",
    data: {
      newAccessToken,
      newRefreshToken,
      newSessionToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const session = req.cookies["better-auth.session_token"];
  if (!session) {
    throw new AppError(status.UNAUTHORIZED, "Session token is missing");
  }

  const payload = req.body;
  const result = await authServices.changePassword(payload, session);

  // update cookies with new tokens
  if (
    result.newAccessToken &&
    result.newRefreshToken &&
    result.newSessionToken
  ) {
    tokenUtils.setAccessTokenCookie(res, result.newAccessToken);
    tokenUtils.setRefreshTokenCookie(res, result.newRefreshToken);
    tokenUtils.setBetterAuthSessionTokenCookie(res, result.newSessionToken);
  }

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Session token is missing");
  }

  await authServices.logout(sessionToken);

  // Clear cookies
  cookieUtils.clearCookie(res, "access_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "refresh_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Logged out successfully",
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as ForgotPasswordZodSchema;
  const result = await authServices.forgetPassword(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message:
      "If a user with that email exists, a password reset link has been sent.",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authServices.resetPassword(payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

const activateUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await authServices.activateUser(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User activated successfully",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Unauthorized Access! User not found in request",
    );
  }

  const result = await authServices.blockUser(req.body, user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

export const authControllers = {
  registerMerchant,
  verifyEmail,
  loginUser,
  getMe,
  getNewTokens,
  logout,
  changePassword,
  forgetPassword,
  resetPassword,
  activateUser,
  blockUser,
};
