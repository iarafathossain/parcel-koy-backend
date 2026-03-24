import status from "http-status";
import AppError from "../../errors/app-error";
import { IRequestUser } from "../../interfaces/auth-type";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import {
  GetSingleMerchantByEmailPayload,
  UpdateMerchantProfilePayload,
} from "./validators";

const updateMerchantProfile = async (
  payload: UpdateMerchantProfilePayload,
  currentUser: IRequestUser,
) => {
  const { merchantId, businessName, pickupAddress, originAreaId } = payload;

  let targetMerchantId: string | undefined;

  if (currentUser.role === "MERCHANT") {
    if (merchantId) {
      throw new AppError(
        status.FORBIDDEN,
        "Merchants are not allowed to update other merchant profiles",
      );
    }

    const merchantProfile = await prisma.merchant.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!merchantProfile) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    targetMerchantId = merchantProfile.id;
  }

  if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
    if (!merchantId) {
      throw new AppError(
        status.BAD_REQUEST,
        "merchantId is required for admin and super admin",
      );
    }

    targetMerchantId = merchantId;
  }

  if (!targetMerchantId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Unable to determine target merchant",
    );
  }

  const existingMerchant = await prisma.merchant.findUnique({
    where: {
      id: targetMerchantId,
    },
  });

  if (!existingMerchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  if (originAreaId) {
    const existingArea = await prisma.area.findUnique({
      where: {
        id: originAreaId,
      },
    });

    if (!existingArea) {
      throw new AppError(status.NOT_FOUND, "Area not found");
    }
  }

  const updateData: Record<string, unknown> = {};

  if (businessName !== undefined) {
    updateData.businessName = businessName;
  }

  if (pickupAddress !== undefined) {
    updateData.pickupAddress = pickupAddress;
  }

  if (originAreaId !== undefined) {
    updateData.originAreaId = originAreaId;
  }

  const merchant = await prisma.merchant.update({
    where: {
      id: targetMerchantId,
    },
    data: updateData,
    include: {
      user: true,
      originArea: true,
    },
  });

  return merchant;
};

const softDeleteMerchant = async (merchantId: string) => {
  const existingMerchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
    include: {
      user: true,
    },
  });

  if (!existingMerchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  if (existingMerchant.user.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Merchant is already deleted");
  }

  await prisma.user.update({
    where: {
      id: existingMerchant.userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
    include: {
      user: true,
      originArea: true,
    },
  });
};

const getAllMerchants = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.merchant, queryParams, {
    searchableFields: [
      "businessName",
      "pickupAddress",
      "user.name",
      "user.email",
      "user.contactNumber",
      "originArea.name",
      "originArea.slug",
    ],
    filterableFields: [
      "originAreaId",
      "user.email",
      "user.status",
      "user.gender",
      "user.isDeleted",
      "originArea.slug",
    ],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        user: true,
        originArea: true,
        parcels: true,
      },
      ["user", "originArea"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getSingleMerchantById = async (merchantId: string) => {
  const merchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
    include: {
      user: true,
      originArea: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  return merchant;
};

const getSingleMerchantByEmail = async (
  payload: GetSingleMerchantByEmailPayload,
) => {
  const merchant = await prisma.merchant.findFirst({
    where: {
      user: {
        email: payload.email,
      },
    },
    include: {
      user: true,
      originArea: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  return merchant;
};

const getAllParcelByMerchantId = async (
  merchantId: string,
  queryParams: IQueryParams,
  currentUser: IRequestUser,
) => {
  const merchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  if (currentUser.role === "MERCHANT") {
    const currentMerchant = await prisma.merchant.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!currentMerchant) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    if (currentMerchant.id !== merchantId) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not allowed to access parcels of other merchants",
      );
    }
  }

  const queryBuilder = new QueryBuilder(prisma.parcel, queryParams, {
    searchableFields: [
      "trackingId",
      "receiverName",
      "receiverContactNumber",
      "pickupAddress",
      "deliveryAddress",
    ],
    filterableFields: [
      "status",
      "categoryId",
      "originAreaId",
      "destinationAreaId",
      "speedId",
      "methodId",
      "pickupRiderId",
      "deliveryRiderId",
      "originHubId",
      "destinationHubId",
    ],
  })
    .where({
      merchantId: merchantId,
    })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        merchant: true,
        category: true,
        originArea: true,
        destinationArea: true,
        speed: true,
        method: true,
      },
      ["merchant", "category", "originArea", "destinationArea"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const deleteMerchantById = async (merchantId: string) => {
  const existingMerchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
    include: {
      user: true,
    },
  });

  if (!existingMerchant) {
    throw new AppError(status.NOT_FOUND, "Merchant not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.merchant.delete({
      where: {
        id: merchantId,
      },
    });
    await tx.user.delete({
      where: {
        id: existingMerchant.userId,
      },
    });
  });
};

export const merchantServices = {
  updateMerchantProfile,
  softDeleteMerchant,
  getAllMerchants,
  getSingleMerchantById,
  getSingleMerchantByEmail,
  getAllParcelByMerchantId,
  deleteMerchantById,
};
