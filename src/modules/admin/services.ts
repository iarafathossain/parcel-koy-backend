import status from "http-status";
import AppError from "../../errors/app-error";
import { UserStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/auth-type";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import {
  ActivateUserPayload,
  BlockUserPayload,
  DeleteUserPayload,
  GetSingleAdminByEmailPayload,
  UpdateAdminProfilePayload,
} from "./validators";

const updateAdminProfile = async (
  payload: UpdateAdminProfilePayload,
  currentUser: IRequestUser,
) => {
  const {
    adminId,
    name,
    image,
    contactNumber,
    gender,
    presentAddress,
    permanentAddress,
  } = payload;

  let targetAdminId: string | undefined;
  let targetUserId: string | undefined;

  const adminProfile = await prisma.admin.findUnique({
    where: {
      userId: currentUser.userId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!adminProfile) {
    throw new AppError(status.NOT_FOUND, "Admin profile not found");
  }

  if (adminId) {
    const targetAdmin = await prisma.admin.findUnique({
      where: {
        id: adminId,
      },
      include: {
        user: true,
      },
    });

    if (!targetAdmin) {
      throw new AppError(status.NOT_FOUND, "Admin not found");
    }

    // Admin cannot update super-admin
    if (
      currentUser.role === "ADMIN" &&
      targetAdmin.user.role === "SUPER_ADMIN"
    ) {
      throw new AppError(
        status.FORBIDDEN,
        "Admin cannot update super-admin profile",
      );
    }

    targetAdminId = adminId;
    targetUserId = targetAdmin.userId;
  } else {
    // Update own profile
    targetAdminId = adminProfile.id;
    targetUserId = adminProfile.userId;
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      id: targetAdminId,
    },
  });

  if (!existingAdmin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  const adminUpdateData: Record<string, unknown> = {};
  const userUpdateData: Record<string, unknown> = {};

  if (presentAddress !== undefined) {
    adminUpdateData.presentAddress = presentAddress;
  }

  if (permanentAddress !== undefined) {
    adminUpdateData.permanentAddress = permanentAddress;
  }

  if (name !== undefined) {
    userUpdateData.name = name;
  }

  if (image !== undefined) {
    userUpdateData.image = image;
  }

  if (contactNumber !== undefined) {
    userUpdateData.contactNumber = contactNumber;
  }

  if (gender !== undefined) {
    userUpdateData.gender = gender;
  }

  return await prisma.$transaction(async (tx) => {
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: targetUserId },
        data: userUpdateData,
      });
    }

    if (Object.keys(adminUpdateData).length > 0) {
      await tx.admin.update({
        where: { id: targetAdminId },
        data: adminUpdateData,
      });
    }

    return await tx.admin.findUnique({
      where: { id: targetAdminId },
      include: {
        user: true,
      },
    });
  });
};

const softDeleteAdmin = async (adminId: string, currentUser: IRequestUser) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    include: {
      user: true,
    },
  });

  if (!existingAdmin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  // Admin cannot delete super-admin
  if (
    currentUser.role === "ADMIN" &&
    existingAdmin.user.role === "SUPER_ADMIN"
  ) {
    throw new AppError(status.FORBIDDEN, "Admin cannot delete super-admin");
  }

  if (existingAdmin.user.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Admin is already deleted");
  }

  await prisma.user.update({
    where: {
      id: existingAdmin.userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    include: {
      user: true,
    },
  });
};

const getAllAdmins = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.admin, queryParams, {
    searchableFields: [
      "presentAddress",
      "permanentAddress",
      "user.name",
      "user.email",
      "user.contactNumber",
      "managedHubs.name",
    ],
    filterableFields: [
      "user.email",
      "user.status",
      "user.gender",
      "user.isDeleted",
      "user.role",
      "managedHubs.id",
      "managedHubs.name",
      "managedHubs.slug",
    ],
    arrayRelations: ["managedHubs"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        user: true,
        managedHubs: true,
      },
      ["user", "managedHubs"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getSingleAdminById = async (adminId: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    include: {
      user: true,
      managedHubs: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  return admin;
};

const getSingleAdminByEmail = async (payload: GetSingleAdminByEmailPayload) => {
  const admin = await prisma.admin.findFirst({
    where: {
      user: {
        email: payload.email,
      },
    },
    include: {
      user: true,
      managedHubs: true,
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  return admin;
};

const deleteAdminById = async (adminId: string) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      id: adminId,
    },
    include: {
      user: true,
    },
  });

  if (!existingAdmin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.admin.delete({
      where: {
        id: adminId,
      },
    });
    await tx.user.delete({
      where: {
        id: existingAdmin.userId,
      },
    });
  });
};

const activateUser = async (
  payload: ActivateUserPayload,
  currentUser: IRequestUser,
) => {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!targetUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Admin cannot activate super-admin
  if (currentUser.role === "ADMIN" && targetUser.role === "SUPER_ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot activate super-admin");
  }

  // Admin can activate merchant and rider, but not other admins except super-admin is allowed for super-admin only
  if (currentUser.role === "ADMIN" && targetUser.role === "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot activate another admin");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: payload.userId,
    },
    data: {
      status: "ACTIVE" as UserStatus,
    },
  });

  return updatedUser;
};

const blockUser = async (
  payload: BlockUserPayload,
  currentUser: IRequestUser,
) => {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!targetUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Admin cannot block super-admin
  if (currentUser.role === "ADMIN" && targetUser.role === "SUPER_ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot block super-admin");
  }

  // Admin can block merchant and rider, but not other admins
  if (currentUser.role === "ADMIN" && targetUser.role === "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot block another admin");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: payload.userId,
    },
    data: {
      status: "BLOCKED" as UserStatus,
    },
  });

  return updatedUser;
};

const deleteUser = async (
  payload: DeleteUserPayload,
  currentUser: IRequestUser,
) => {
  const targetUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!targetUser) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  // Admin cannot delete super-admin
  if (currentUser.role === "ADMIN" && targetUser.role === "SUPER_ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot delete super-admin");
  }

  // Admin can delete merchant and rider, but not other admins
  if (currentUser.role === "ADMIN" && targetUser.role === "ADMIN") {
    throw new AppError(status.FORBIDDEN, "Admin cannot delete another admin");
  }

  // Delete related data based on role and perform hard delete
  await prisma.$transaction(async (tx) => {
    if (targetUser.role === "MERCHANT") {
      await tx.merchant.deleteMany({
        where: {
          userId: payload.userId,
        },
      });
    } else if (targetUser.role === "RIDER") {
      await tx.rider.deleteMany({
        where: {
          userId: payload.userId,
        },
      });
    } else if (targetUser.role === "ADMIN") {
      await tx.admin.deleteMany({
        where: {
          userId: payload.userId,
        },
      });
    }

    await tx.user.delete({
      where: {
        id: payload.userId,
      },
    });
  });
};

export const adminServices = {
  updateAdminProfile,
  softDeleteAdmin,
  getAllAdmins,
  getSingleAdminById,
  getSingleAdminByEmail,
  deleteAdminById,
  activateUser,
  blockUser,
  deleteUser,
};
