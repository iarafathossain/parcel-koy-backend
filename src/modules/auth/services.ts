import status from "http-status";
import { envVariables } from "../../config/env";
import AppError from "../../errors/app-error";
import { UserStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/auth-type";
import { auth } from "../../libs/auth";
import { prisma } from "../../libs/prisma";
import { jwtUtils } from "../../utils/jwt";
import { parseDurationToMs, tokenUtils } from "../../utils/token";
import {
  ChangePasswordZodSchema,
  ForgotPasswordZodSchema,
  LoginUserZodSchema,
  RegisterMerchantZodSchema,
  ResetPasswordZodSchema,
  VerifyEmailZodSchema,
} from "./validators";

const checkUser = async (email: string) => {
  // check if the user exists with the given email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "User with the given email does not exist",
    );
  }

  if (!user.emailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "Email is not verified. Please verify your email before resetting password.",
    );
  }

  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Your account has been deleted. Please contact support.",
    );
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(
      status.BAD_REQUEST,
      "Your account is blocked. Please contact support.",
    );
  }

  return user;
};

const registerMerchant = async (payload: RegisterMerchantZodSchema) => {
  const {
    email,
    password,
    contactNumber,
    name,
    businessName,
    pickupAddress,
    originAreaId,
  } = payload;

  // step 1: check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(status.BAD_REQUEST, "Email already exists");
  }

  // step 2: check if contact number already exists
  const existingContactNumber = await prisma.user.findFirst({
    where: {
      contactNumber: payload.contactNumber,
    },
  });

  if (existingContactNumber) {
    throw new AppError(status.BAD_REQUEST, "Contact number already exists");
  }

  // step 3: check origin area exists
  const existingOriginArea = await prisma.area.findUnique({
    where: {
      id: originAreaId,
    },
  });

  if (!existingOriginArea) {
    throw new AppError(status.BAD_REQUEST, "Origin area does not exist");
  }

  // step 4: create new user with better-auth
  const { user, token: sessionToken } = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      contactNumber,
    },
  });

  if (!user) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
  }

  try {
    // step 5: create merchant profile in the database
    const merchant = await prisma.merchant.create({
      data: {
        userId: user.id,
        businessName,
        pickupAddress,
        originAreaId,
      },
    });

    // When email verification is required, Better Auth returns token: null.
    // Only issue app tokens if Better Auth session exists.
    const accessToken = sessionToken
      ? tokenUtils.getAccessToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          status: user.status,
          isDeleted: user.isDeleted,
          emailVerified: user.emailVerified,
        })
      : null;

    const refreshToken = sessionToken
      ? tokenUtils.getRefreshToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          status: user.status,
          isDeleted: user.isDeleted,
          emailVerified: user.emailVerified,
        })
      : null;

    return {
      user,
      merchant,
      accessToken,
      refreshToken,
      sessionToken,
      requiresEmailVerification: !sessionToken,
    };
  } catch (error) {
    // delete the user if merchant creation failed
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to create merchant account",
    );
  }
};

const verifyEmail = async (payload: VerifyEmailZodSchema) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email: payload.email,
      otp: payload.otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        id: result.user.id,
      },
      data: {
        emailVerified: true,
      },
    });
  }

  const accessToken = result.token
    ? tokenUtils.getAccessToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
        status: result.user.status,
        isDeleted: result.user.isDeleted,
        emailVerified: result.user.emailVerified,
      })
    : null;

  const refreshToken = result.token
    ? tokenUtils.getRefreshToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: result.user.name,
        status: result.user.status,
        isDeleted: result.user.isDeleted,
        emailVerified: result.user.emailVerified,
      })
    : null;

  return {
    status: result.status,
    user: result.user,
    sessionToken: result.token,
    accessToken,
    refreshToken,
  };
};

const loginUser = async (payload: LoginUserZodSchema) => {
  const { email, password } = payload;

  const { user, token: sessionToken } = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  // check if the user is authenticated
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  // check if a user is blocked
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Your account is blocked. Please contact support.",
    );
  }

  // check if a user is deleted
  if (user.isDeleted || user.status === UserStatus.DELETED) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Your account has been deleted. Please contact support.",
    );
  }

  // check if email is verified
  if (!user.emailVerified) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Email is not verified. Please verify your email before logging in.",
    );
  }

  // check if needPasswordChange flag is true, if true, prompt the user to change password before allowing access to the application
  if (user.needPasswordChange) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You need to change your password before logging in. Please use the forget password option to change your password.",
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });

  return { user, accessToken, refreshToken, sessionToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      merchantProfile: {
        include: {
          parcels: true,
        },
      },

      adminProfile: true,
      riderProfile: true,
    },
  });

  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExist;
};

const getNewTokens = async (refreshToken: string, sessionToken: string) => {
  // check the existing session token
  const existingSessiontoken = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!existingSessiontoken) {
    throw new AppError(status.UNAUTHORIZED, "Invalid token");
  }

  // check if the refresh token is valid
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVariables.REFRESH_TOKEN_SECRET,
  );

  if (
    !verifiedRefreshToken ||
    verifiedRefreshToken.data?.userId !== existingSessiontoken.userId ||
    verifiedRefreshToken.data?.isDeleted ||
    verifiedRefreshToken.data?.status === UserStatus.BLOCKED
  ) {
    throw new AppError(status.UNAUTHORIZED, "Invalid token");
  }

  const verifiedUser = verifiedRefreshToken.data;

  const newAccessToken = tokenUtils.getAccessToken({
    userId: verifiedUser.userId,
    email: verifiedUser.email,
    role: verifiedUser.role,
    name: verifiedUser.name,
    status: verifiedUser.status,
    isDeleted: verifiedUser.isDeleted,
    emailVerified: verifiedUser.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: verifiedUser.userId,
    email: verifiedUser.email,
    role: verifiedUser.role,
    name: verifiedUser.name,
    status: verifiedUser.status,
    isDeleted: verifiedUser.isDeleted,
    emailVerified: verifiedUser.emailVerified,
  });

  // update the session with the new expiry time
  const { token: newSessionToken } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(
        Date.now() +
          parseDurationToMs(envVariables.BETTER_AUTH_SESSION_COOKIE_MAX_AGE),
      ),
      createdAt: new Date(),
    },
  });

  return {
    newAccessToken,
    newRefreshToken,
    newSessionToken,
  };
};

const changePassword = async (
  payload: ChangePasswordZodSchema,
  sessionToken: string,
) => {
  const { currentPassword, newPassword } = payload;

  // check the existing session token
  const existingSessionToken = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!existingSessionToken) {
    throw new AppError(status.UNAUTHORIZED, "Invalid token");
  }

  // change the password using BetterAuth API
  const { user, token: newSessionToken } = await auth.api.changePassword({
    body: {
      newPassword: newPassword,
      currentPassword: currentPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // update the needPasswordChange flag to false in the database if needPasswordChange is true
  if (existingSessionToken.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: existingSessionToken.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  // create a new access token and refresh token for the user after password change
  const newAccessToken = tokenUtils.getAccessToken({
    userId: existingSessionToken.user.id,
    email: existingSessionToken.user.email,
    role: existingSessionToken.user.role,
    name: existingSessionToken.user.name,
    status: existingSessionToken.user.status,
    isDeleted: existingSessionToken.user.isDeleted,
    emailVerified: existingSessionToken.user.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: existingSessionToken.user.id,
    email: existingSessionToken.user.email,
    role: existingSessionToken.user.role,
    name: existingSessionToken.user.name,
    status: existingSessionToken.user.status,
    isDeleted: existingSessionToken.user.isDeleted,
    emailVerified: existingSessionToken.user.emailVerified,
  });

  return {
    newAccessToken,
    newRefreshToken,
    newSessionToken,
    user,
  };
};

const logout = async (sessionToken: string) => {
  return await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });
};

const forgetPassword = async (payload: ForgotPasswordZodSchema) => {
  const { email } = payload;

  await checkUser(email);

  // send password reset OTP to the user's email
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

const resetPassword = async (payload: ResetPasswordZodSchema) => {
  const { email, otp, newPassword } = payload;
  const user = await checkUser(email);

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }
};

export const authServices = {
  registerMerchant,
  verifyEmail,
  loginUser,
  getMe,
  getNewTokens,
  logout,
  changePassword,
  forgetPassword,
  resetPassword,
};
