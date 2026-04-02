import status from "http-status";
import AppError from "../../errors/app-error";
import { PayoutStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/auth-type";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import {
  GetSingleMerchantByEmailPayload,
  MakePaymentRequestPayload,
  UpdateMerchantProfilePayload,
} from "./validators";

const updateMerchantProfile = async (
  payload: UpdateMerchantProfilePayload,
  currentUser: IRequestUser,
) => {
  const {
    merchantId,
    name,
    image,
    contactNumber,
    gender,
    businessName,
    pickupAddress,
    originAreaId,
  } = payload;

  let targetMerchantId: string | undefined;
  let targetUserId: string | undefined;

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
        userId: true,
      },
    });

    if (!merchantProfile) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    targetMerchantId = merchantProfile.id;
    targetUserId = merchantProfile.userId;
  }

  if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
    if (!merchantId) {
      throw new AppError(
        status.BAD_REQUEST,
        "merchantId is required for admin and super admin",
      );
    }

    const merchantProfile = await prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
      select: {
        userId: true,
      },
    });

    if (!merchantProfile) {
      throw new AppError(status.NOT_FOUND, "Merchant not found");
    }

    targetMerchantId = merchantId;
    targetUserId = merchantProfile.userId;
  }

  if (!targetMerchantId || !targetUserId) {
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

  const merchantUpdateData: Record<string, unknown> = {};
  const userUpdateData: Record<string, unknown> = {};

  if (businessName !== undefined) {
    merchantUpdateData.businessName = businessName;
  }

  if (pickupAddress !== undefined) {
    merchantUpdateData.pickupAddress = pickupAddress;
  }

  if (originAreaId !== undefined) {
    merchantUpdateData.originAreaId = originAreaId;
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

    if (Object.keys(merchantUpdateData).length > 0) {
      await tx.merchant.update({
        where: { id: targetMerchantId },
        data: merchantUpdateData,
      });
    }

    return await tx.merchant.findUnique({
      where: { id: targetMerchantId },
      include: {
        user: true,
        originArea: true,
      },
    });
  });
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

const makePaymentRequest = async (
  payload: MakePaymentRequestPayload,
  userId: string,
) => {
  // 1. Fetch the merchant's current balance
  const merchant = await prisma.merchant.findUnique({
    where: { userId: userId },
    select: { id: true, balance: true },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant profile not found");
  }

  // validate payment account belongs to the merchant
  const paymentAccount = await prisma.paymentAccount.findFirst({
    where: {
      id: payload.paymentAccountId,
      merchantId: merchant.id,
      isActive: true,
    },
  });

  if (!paymentAccount) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid or inactive payment account selected. Please check your bank details.",
    );
  }

  const currentBalance = Number(merchant.balance);

  // 2. Simply check if they have enough in their wallet
  if (payload.amount > currentBalance) {
    throw new AppError(
      status.BAD_REQUEST,
      `Insufficient balance. Your withdrawable balance is ${currentBalance} USD, but you requested ${payload.amount} USD.`,
    );
  }

  // 3. Create payout and deduct balance instantly
  return await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        merchantId: merchant.id,
        amount: payload.amount,
        status: PayoutStatus.PENDING,
        paymentAccountId: payload.paymentAccountId,
      },
      include: {
        paymentAccount: true,
      },
    });

    await tx.merchant.update({
      where: { id: merchant.id },
      data: {
        balance: { decrement: payload.amount },
      },
    });

    return payout;
  });
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
  makePaymentRequest,
  deleteMerchantById,
};
