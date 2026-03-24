import status from "http-status";
import AppError from "../../errors/app-error";
import { IRequestUser } from "../../interfaces/auth-type";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import {
  GetSingleRiderByEmailPayload,
  UpdateRiderHubPayload,
  UpdateRiderProfilePayload,
} from "./validators";

const updateRiderProfile = async (
  payload: UpdateRiderProfilePayload,
  currentUser: IRequestUser,
) => {
  const { riderId, presentAddress, permanentAddress, age } = payload;

  let targetRiderId: string | undefined;

  if (currentUser.role === "RIDER") {
    if (riderId) {
      throw new AppError(
        status.FORBIDDEN,
        "Riders are not allowed to update other rider profiles",
      );
    }

    const riderProfile = await prisma.rider.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!riderProfile) {
      throw new AppError(status.NOT_FOUND, "Rider profile not found");
    }

    targetRiderId = riderProfile.id;
  }

  if (currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") {
    if (!riderId) {
      throw new AppError(
        status.BAD_REQUEST,
        "riderId is required for admin and super admin",
      );
    }

    targetRiderId = riderId;
  }

  if (!targetRiderId) {
    throw new AppError(status.BAD_REQUEST, "Unable to determine target rider");
  }

  const existingRider = await prisma.rider.findUnique({
    where: {
      id: targetRiderId,
    },
  });

  if (!existingRider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  const updateData: Record<string, unknown> = {};

  if (presentAddress !== undefined) {
    updateData.presentAddress = presentAddress;
  }

  if (permanentAddress !== undefined) {
    updateData.permanentAddress = permanentAddress;
  }

  if (age !== undefined) {
    updateData.age = age;
  }

  const rider = await prisma.rider.update({
    where: {
      id: targetRiderId,
    },
    data: updateData,
    include: {
      user: true,
      hub: true,
    },
  });

  return rider;
};

const updateRiderHub = async (
  riderId: string,
  payload: UpdateRiderHubPayload,
) => {
  const existingRider = await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
  });

  if (!existingRider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  const existingHub = await prisma.hub.findUnique({
    where: {
      id: payload.hubId,
    },
  });

  if (!existingHub) {
    throw new AppError(status.NOT_FOUND, "Hub not found");
  }

  const rider = await prisma.rider.update({
    where: {
      id: riderId,
    },
    data: {
      hubId: payload.hubId,
    },
    include: {
      user: true,
      hub: true,
    },
  });

  return rider;
};

const softDeleteRider = async (riderId: string) => {
  const existingRider = await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
    include: {
      user: true,
    },
  });

  if (!existingRider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  if (existingRider.user.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Rider is already deleted");
  }

  await prisma.user.update({
    where: {
      id: existingRider.userId,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
    include: {
      user: true,
      hub: true,
    },
  });
};

const getAllRiders = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.rider, queryParams, {
    searchableFields: [
      "presentAddress",
      "permanentAddress",
      "user.name",
      "user.email",
      "user.contactNumber",
      "hub.name",
      "hub.slug",
    ],
    filterableFields: [
      "hubId",
      "age",
      "user.email",
      "user.status",
      "user.gender",
      "user.isDeleted",
      "hub.slug",
    ],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        user: true,
        hub: true,
        pickups: true,
        deliveries: true,
      },
      ["user", "hub"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getSingleRiderById = async (riderId: string) => {
  const rider = await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
    include: {
      user: true,
      hub: true,
    },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  return rider;
};

const getSingleRiderByEmail = async (payload: GetSingleRiderByEmailPayload) => {
  const rider = await prisma.rider.findFirst({
    where: {
      user: {
        email: payload.email,
      },
    },
    include: {
      user: true,
      hub: true,
    },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  return rider;
};

const getAllParcelByRider = async (
  riderId: string,
  queryParams: IQueryParams,
  currentUser: IRequestUser,
) => {
  const rider = await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  if (currentUser.role === "RIDER") {
    const currentRider = await prisma.rider.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!currentRider) {
      throw new AppError(status.NOT_FOUND, "Rider profile not found");
    }

    if (currentRider.id !== riderId) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not allowed to access parcels of other riders",
      );
    }
  }

  let merchantId: string | undefined;
  if (currentUser.role === "MERCHANT") {
    const merchant = await prisma.merchant.findUnique({
      where: {
        userId: currentUser.userId,
      },
      select: {
        id: true,
      },
    });

    if (!merchant) {
      throw new AppError(status.NOT_FOUND, "Merchant profile not found");
    }

    merchantId = merchant.id;
  }

  const riderParcelCondition = {
    OR: [
      {
        pickupRiderId: riderId,
        status: {
          in: ["PICKED_UP", "PICKUP_FAILED"],
        },
      },
      {
        deliveryRiderId: riderId,
        status: {
          in: ["DELIVERED", "DELIVERY_FAILED"],
        },
      },
    ],
  };

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
      "merchantId",
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
    .where(
      merchantId
        ? {
            AND: [{ merchantId }, riderParcelCondition],
          }
        : {
            AND: [riderParcelCondition],
          },
    )
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

export const riderServices = {
  updateRiderProfile,
  updateRiderHub,
  softDeleteRider,
  getAllRiders,
  getSingleRiderById,
  getSingleRiderByEmail,
  getAllParcelByRider,
};
