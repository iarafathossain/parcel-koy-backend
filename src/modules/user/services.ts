import status from "http-status";
import AppError from "../../errors/app-error.js";
import { getError } from "../../errors/get-error.js";
import { Role } from "../../generated/prisma/enums.js";
import { auth } from "../../libs/auth.js";
import { prisma } from "../../libs/prisma.js";
import { CreateAdminZodSchema, CreateRiderZodSchema } from "./validators.js";

const createAdmin = async (payload: CreateAdminZodSchema) => {
  const { password, admin } = payload;
  const { name, email, contactNumber, gender } = admin;

  // validate user existence
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      status.BAD_REQUEST,
      "User with this email already exists",
    );
  }

  // sign up user with better auth
  const { user } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role: Role.ADMIN,
      contactNumber,
      gender,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  if (!user) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
  }

  // create admin record in transaction
  try {
    return await prisma.$transaction(async (tx) => {
      const createdAdmin = await tx.admin.create({
        data: {
          userId: user.id,
        },
      });

      // fetch the created admin with user details
      return await tx.admin.findUnique({
        where: {
          id: createdAdmin.id,
        },
        include: {
          user: true,
        },
      });
    });
  } catch (error: unknown) {
    try {
      // delete the user from user table if admin creation fails
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    } catch (error: unknown) {
      console.error(
        "Error rolling back user creation after admin creation failure: ",
        error,
      );
    }
    throw new AppError(status.INTERNAL_SERVER_ERROR, getError(error));
  }
};

const createRider = async (payload: CreateRiderZodSchema) => {
  const { password, rider } = payload;
  const {
    name,
    email,
    contactNumber,
    gender,
    presentAddress,
    permanentAddress,
    age,
    hubId,
  } = rider;

  // validate hub existence for rider assignment
  const existingHub = await prisma.hub.findUnique({
    where: {
      id: hubId,
    },
  });

  if (!existingHub) {
    throw new AppError(status.NOT_FOUND, "Hub not found");
  }

  // validate user existence
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      status.BAD_REQUEST,
      "User with this email already exists",
    );
  }

  // sign up user with better auth
  const { user } = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      role: Role.RIDER,
      contactNumber,
      gender,
      needPasswordChange: true,
      rememberMe: false,
    },
  });

  if (!user) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user");
  }

  // create rider record in transaction
  try {
    return await prisma.$transaction(async (tx) => {
      const createdRider = await tx.rider.create({
        data: {
          userId: user.id,
          presentAddress,
          permanentAddress,
          age,
          hubId,
        },
      });

      // fetch the created rider with user details
      return await tx.rider.findUnique({
        where: {
          id: createdRider.id,
        },
        include: {
          user: true,
          hub: true,
        },
      });
    });
  } catch (error: unknown) {
    try {
      // delete the user from user table if rider creation fails
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
    } catch (error: unknown) {
      console.error(
        "Error rolling back user creation after rider creation failure: ",
        error,
      );
    }
    throw new AppError(status.INTERNAL_SERVER_ERROR, getError(error));
  }
};

export const userService = {
  createAdmin,
  createRider,
};
