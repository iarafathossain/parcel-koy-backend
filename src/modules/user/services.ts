import status from "http-status";
import AppError from "../../errors/app-error";
import { getError } from "../../errors/get-error";
import { Role } from "../../generated/prisma/enums";
import { auth } from "../../libs/auth";
import { prisma } from "../../libs/prisma";
import { CreateAdminZodSchema } from "./validators";

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

/**
 TODO: create rider service.
 By following create-admin pattern complete create-rider route -> controller -> service
 */

export const userService = {
  createAdmin,
};
