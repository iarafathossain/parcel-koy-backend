import status from "http-status";
import { envVariables } from "../../config/env";
import AppError from "../../errors/app-error";
import { ParcelStatus } from "../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { generateTrackingID } from "../../utils/generate-tracking-id";
import { QueryBuilder } from "../../utils/query-builder";
import { parseDurationToMs } from "../../utils/token";
import { notificationServices } from "../notification/services";
import {
  CancelParcelByMerchantPayload,
  CreateParcelPayload,
  UpdateParcelPayload,
  UpdateParcelStatusByAdminPayload,
  UpdateParcelStatusByRiderPayload,
} from "./validators";

const resolveHubIdForStatus = (
  statusValue: ParcelStatus,
  parcel: { originHubId: string | null; destinationHubId: string | null },
): string | undefined => {
  const originSideStatuses: ParcelStatus[] = [
    ParcelStatus.REQUESTED,
    ParcelStatus.PICKUP_RIDER_ASSIGNED,
    ParcelStatus.PICKED_UP,
    ParcelStatus.PICKUP_FAILED,
    ParcelStatus.CANCELLED,
    ParcelStatus.RECEIVED_AT_ORIGIN_HUB,
  ];

  const destinationSideStatuses: ParcelStatus[] = [
    ParcelStatus.RECEIVED_AT_DESTINATION_HUB,
    ParcelStatus.OUT_FOR_DELIVERY,
    ParcelStatus.DELIVERY_FAILED,
    ParcelStatus.PARTIAL_DELIVERY,
    ParcelStatus.DELIVERED,
    ParcelStatus.RETURNED_TO_MERCHANT,
  ];

  if (originSideStatuses.includes(statusValue)) {
    return parcel.originHubId ?? undefined;
  }

  if (destinationSideStatuses.includes(statusValue)) {
    return parcel.destinationHubId ?? undefined;
  }

  return undefined;
};

const getAllParcels = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.parcel, queryParams, {
    searchableFields: [
      "trackingId",
      "pickupAddress",
      "deliveryAddress",
      "receiverName",
      "receiverContactNumber",
      "merchant.businessName",
      "category.name",
      "originArea.name",
      "destinationArea.name",
      "originHub.name",
      "destinationHub.name",
    ],
    filterableFields: [
      "trackingId",
      "status",
      "merchantId",
      "categoryId",
      "originAreaId",
      "destinationAreaId",
      "originHubId",
      "destinationHubId",
      "pickupRiderId",
      "deliveryRiderId",
      "speedId",
      "pickupMethodId",
      "deliveryMethodId",
      "isFragile",
    ],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        merchant: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                contactNumber: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        destinationArea: {
          select: {
            id: true,
            name: true,
          },
        },
        originArea: {
          select: {
            id: true,
            name: true,
          },
        },
        speed: {
          select: {
            id: true,
            name: true,
          },
        },
        pickupMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        deliveryMethod: {
          select: {
            id: true,
            name: true,
          },
        },
        pickupRider: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                contactNumber: true,
              },
            },
          },
        },
        deliveryRider: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                contactNumber: true,
              },
            },
          },
        },
        originHub: {
          select: {
            id: true,
            name: true,
          },
        },
        destinationHub: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      [
        "merchant",
        "category",
        "destinationArea",
        "originArea",
        "speed",
        "pickupMethod",
        "deliveryMethod",
        "pickupRider",
        "deliveryRider",
        "originHub",
        "destinationHub",
      ],
    )
    .paginate();

  return await queryBuilder.execute();
};

const createParcel = async (payload: CreateParcelPayload, userId: string) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: userId },
    select: {
      id: true,
      originAreaId: true,
      pickupAddress: true,
      balance: true,
      creditLimit: true,
      userId: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.BAD_REQUEST, "Merchant not found");
  }

  const merchantOriginAreaId = merchant.originAreaId;
  const merchantPickupAddress = merchant.pickupAddress;

  const trackingID = generateTrackingID();

  // validate the pickup method
  const pickupMethod = await prisma.method.findUnique({
    where: { id: payload.pickupMethodId },
    select: { baseFee: true, slug: true, id: true },
  });

  if (!pickupMethod) {
    throw new AppError(status.BAD_REQUEST, "Invalid pickup method selected");
  }

  // validate the delivery method
  const deliveryMethod = await prisma.method.findUnique({
    where: { id: payload.deliveryMethodId },
    select: { baseFee: true, slug: true, id: true },
  });

  if (!deliveryMethod) {
    throw new AppError(status.BAD_REQUEST, "Invalid delivery method selected");
  }

  // if method is "pick & drop", originAreaId is required, otherwise use merchant's origin area
  const originAreaId =
    pickupMethod.slug === "pick-drop"
      ? payload.originAreaId
      : merchantOriginAreaId;

  const pickupAddress =
    pickupMethod.slug === "pick-drop"
      ? payload.pickupAddress
      : merchantPickupAddress;

  if (!originAreaId) {
    throw new AppError(status.BAD_REQUEST, "Origin area is required");
  }

  if (!pickupAddress) {
    throw new AppError(status.BAD_REQUEST, "Pickup address is required");
  }

  // get the destination zone from the destination area
  const destinationArea = await prisma.area.findUnique({
    where: { id: payload.destinationAreaId },
    select: { zoneId: true, hubID: true },
  });

  if (!destinationArea) {
    throw new AppError(status.BAD_REQUEST, "Invalid destination area selected");
  }

  // get the origin zone from the origin area
  const originArea = await prisma.area.findUnique({
    where: { id: originAreaId },
    select: { zoneId: true, hubID: true },
  });

  if (!originArea) {
    throw new AppError(status.BAD_REQUEST, "Invalid origin area selected");
  }

  // ensure declared weight is >= base category weight
  const baseCategoryWeight = await prisma.category.findUnique({
    where: { id: payload.categoryId },
    select: { baseWeight: true, slug: true },
  });

  if (!baseCategoryWeight) {
    throw new AppError(status.BAD_REQUEST, "Invalid category selected");
  }

  // Use the category base weight for pricing when declared weight is lower.
  const minWeight =
    payload.declaredWeight < baseCategoryWeight.baseWeight
      ? baseCategoryWeight.baseWeight
      : payload.declaredWeight;

  const deliveryCharge = await prisma.pricing.findFirst({
    where: {
      originalZoneId: originArea?.zoneId,
      destinationZoneId: destinationArea?.zoneId,
      speedId: payload.speedId,
      pickupMethodId: pickupMethod.id,
      deliveryMethodId: deliveryMethod.id,
      categoryId: payload.categoryId,
      minWeight: { lte: minWeight },
      maxWeight: { gte: minWeight },
    },
    select: { price: true },
  });

  if (!deliveryCharge) {
    throw new AppError(
      status.BAD_REQUEST,
      "No pricing found for the given parameters. Please contact support.",
    );
  }

  // 1. Calculate what merchant balance will become
  const projectedBalance =
    Number(merchant.balance) - Number(deliveryCharge.price);

  // 2. The Credit Limit Check
  if (projectedBalance < Number(merchant.creditLimit)) {
    throw new AppError(
      status.PAYMENT_REQUIRED,
      `Credit limit exceeded. Your balance is ${merchant.balance} BDT. This delivery costs ${deliveryCharge.price} BDT. Please recharge your account or wait for pending deliveries to complete.`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // create the parcel
    const createdParcel = await tx.parcel.create({
      data: {
        trackingId: trackingID,
        merchantId: merchant.id,
        categoryId: payload.categoryId,
        destinationAreaId: payload.destinationAreaId,
        originAreaId: originAreaId,
        originHubId: originArea.hubID,
        destinationHubId: destinationArea.hubID,
        speedId: payload.speedId,
        pickupMethodId: pickupMethod.id,
        deliveryMethodId: deliveryMethod.id,
        declaredWeight: payload.declaredWeight,
        isFragile: payload.isFragile,
        pickupAddress: pickupAddress,
        deliveryAddress: payload.deliveryAddress,
        receiverName: payload.receiverName,
        receiverContactNumber: payload.receiverContactNumber,
        codAmount: payload.codAmount,
        deliveryCharge: deliveryCharge.price,
      },
    });

    // deduct the delivery charge from merchant balance
    await tx.merchant.update({
      where: { id: merchant.id },
      data: {
        balance: {
          decrement: deliveryCharge.price,
        },
      },
    });

    await tx.trackingLog.create({
      data: {
        parcelId: createdParcel.id,
        userId: merchant.userId,
        status: "REQUESTED",
        hubId: createdParcel.originHubId ?? undefined,
        description: "Parcel created and awaiting pickup rider assignment",
      },
    });
  });

  return result;
};

const updateParcel = async (
  parcelId: string,
  payload: UpdateParcelPayload,
  userId: string,
) => {
  // prevent empty payload
  if (Object.keys(payload).length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "At least one field must be provided for update",
    );
  }
  // check if parcel exists
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    include: {
      merchant: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  if (parcel.merchant.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to update this parcel",
    );
  }

  // if method is being updated to "pick & drop", originAreaId and pickupAddress are required
  if (payload.pickupMethodId) {
    const method = await prisma.method.findUnique({
      where: { id: payload.pickupMethodId },
      select: { slug: true },
    });

    if (method?.slug === "pick-drop") {
      if (!payload.originAreaId) {
        throw new AppError(
          status.BAD_REQUEST,
          "Origin area is required for pick & drop method",
        );
      }
      if (!payload.pickupAddress) {
        throw new AppError(
          status.BAD_REQUEST,
          "Pickup address is required for pick & drop method",
        );
      }
    }
  }

  // if destinationAreaId is being updated, get the new destination hub
  let destinationHubId;
  if (payload.destinationAreaId) {
    const destinationArea = await prisma.area.findUnique({
      where: { id: payload.destinationAreaId },
      select: { hubID: true },
    });
    if (!destinationArea) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid destination area selected",
      );
    }
    destinationHubId = destinationArea.hubID;
  }

  // if originAreaId is being updated, get the new origin hub
  let originHubId;
  if (payload.originAreaId) {
    const originArea = await prisma.area.findUnique({
      where: { id: payload.originAreaId },
      select: { hubID: true },
    });
    if (!originArea) {
      throw new AppError(status.BAD_REQUEST, "Invalid origin area selected");
    }
    originHubId = originArea.hubID;
  }

  // update the delivery charge if any of the parameters that affect pricing are being updated
  let deliveryCharge;
  if (
    payload.originAreaId ||
    payload.destinationAreaId ||
    payload.speedId ||
    payload.pickupMethodId ||
    payload.deliveryMethodId ||
    payload.categoryId ||
    payload.declaredWeight
  ) {
    const originArea = await prisma.area.findUnique({
      where: { id: payload.originAreaId || parcel.originAreaId },
      select: { zoneId: true },
    });
    const destinationArea = await prisma.area.findUnique({
      where: { id: payload.destinationAreaId || parcel.destinationAreaId },
      select: { zoneId: true },
    });

    deliveryCharge = await prisma.pricing.findFirst({
      where: {
        originalZoneId: originArea?.zoneId,
        destinationZoneId: destinationArea?.zoneId,
        speedId: payload.speedId || parcel.speedId,
        pickupMethodId: payload.pickupMethodId || parcel.pickupMethodId,
        deliveryMethodId: payload.deliveryMethodId || parcel.deliveryMethodId,
        categoryId: payload.categoryId || parcel.categoryId,
        minWeight: { lte: payload.declaredWeight || parcel.declaredWeight },
        maxWeight: { gte: payload.declaredWeight || parcel.declaredWeight },
      },
      select: { price: true },
    });

    if (!deliveryCharge) {
      throw new AppError(
        status.BAD_REQUEST,
        "No pricing found for the given parameters. Please contact support.",
      );
    }
  }

  // data to be updated
  const data: Record<string, unknown> = {
    ...payload,
  };

  if (destinationHubId) {
    data.destinationHubId = destinationHubId;
  }

  if (originHubId) {
    data.originHubId = originHubId;
  }

  if (deliveryCharge) {
    data.deliveryCharge = deliveryCharge.price;
  }

  // ensure declared weight is >= base category weight if declared weight or category is being updated
  if (payload.declaredWeight) {
    const baseCategoryWeight = await prisma.category.findUnique({
      where: { id: payload.categoryId || parcel.categoryId },
      select: { baseWeight: true, slug: true },
    });

    if (payload.declaredWeight < baseCategoryWeight!.baseWeight) {
      throw new AppError(
        status.BAD_REQUEST,
        `Declared weight must be at least ${baseCategoryWeight!.baseWeight} kg for category ${baseCategoryWeight!.slug}`,
      );
    }
  }

  if (payload.categoryId) {
    data.categoryId = payload.categoryId;
  }
  if (payload.destinationAreaId) {
    data.destinationAreaId = payload.destinationAreaId;
  }
  if (payload.originAreaId) {
    data.originAreaId = payload.originAreaId;
  }

  if (payload.speedId) {
    data.speedId = payload.speedId;
  }

  if (payload.isFragile !== undefined) {
    data.isFragile = payload.isFragile;
  }

  if (payload.receiverName) {
    data.receiverName = payload.receiverName;
  }

  if (payload.receiverContactNumber) {
    data.receiverContactNumber = payload.receiverContactNumber;
  }

  if (payload.deliveryAddress) {
    data.deliveryAddress = payload.deliveryAddress;
  }

  // update the parcel
  const updatedParcel = await prisma.parcel.update({
    where: { id: parcelId },
    data,
  });

  return updatedParcel;
};

const updateParcelStatusByAdmin = async (
  parcelId: string,
  payload: UpdateParcelStatusByAdminPayload,
  userId: string,
) => {
  // check if parcel exists
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  const ALLOWED_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
    REQUESTED: ["PICKUP_RIDER_ASSIGNED", "CANCELLED"],
    PICKUP_RIDER_ASSIGNED: ["PICKED_UP", "PICKUP_FAILED", "CANCELLED"], // Admin can still cancel here
    PICKED_UP: ["RECEIVED_AT_ORIGIN_HUB"],
    RECEIVED_AT_ORIGIN_HUB: ["IN_TRANSIT"],
    IN_TRANSIT: ["RECEIVED_AT_DESTINATION_HUB", "ON_HOLD"],
    ON_HOLD: ["IN_TRANSIT"], // Admin can put the parcel on hold and then take it off hold to continue transit
    RECEIVED_AT_DESTINATION_HUB: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED", "PARTIAL_DELIVERY", "DELIVERY_FAILED"],
    DELIVERY_FAILED: ["OUT_FOR_DELIVERY", "RETURNED_TO_MERCHANT"], // Admin reschedules

    // Terminal states (Cannot be changed normally)
    DELIVERED: [],
    CANCELLED: [],
    RETURNED_TO_MERCHANT: [],
    PICKUP_FAILED: [],
    PARTIAL_DELIVERY: [],
  };

  const currentStatus = parcel.status as ParcelStatus;

  if (!ALLOWED_TRANSITIONS[currentStatus].includes(payload.status)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Invalid status transition from ${currentStatus} to ${payload.status}`,
    );
  }

  if (payload.status === "PICKUP_RIDER_ASSIGNED" && !payload.pickupRiderId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pickup rider ID is required when assigning a pickup rider",
    );
  }

  if (payload.status === "OUT_FOR_DELIVERY" && !payload.deliveryRiderId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Delivery rider ID is required when assigning out for delivery",
    );
  }

  const data: Record<string, unknown> = { status: payload.status };

  if (payload.pickupRiderId) {
    data.pickupRiderId = payload.pickupRiderId;
  }

  if (payload.deliveryRiderId) {
    data.deliveryRiderId = payload.deliveryRiderId;
  }

  // update the parcel and add a tracking log for the status change
  const updatedParcel = await prisma.$transaction(async (tx) => {
    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data,
    });

    if (payload.status === "DELIVERED") {
      await tx.merchant.update({
        where: { id: parcel.merchantId },
        data: {
          balance: {
            increment: parcel.codAmount,
          },
        },
      });
    }

    await tx.trackingLog.create({
      data: {
        parcelId: parcelId,
        userId: userId,
        status: payload.status,
        hubId: resolveHubIdForStatus(payload.status, {
          originHubId: parcel.originHubId,
          destinationHubId: parcel.destinationHubId,
        }),
        description: `Parcel status updated to ${payload.status} by admin`,
      },
    });
    return updated;
  });

  // Notify merchant for key status updates
  const KEY_STATUSES_FOR_MERCHANT = [
    "PICKUP_RIDER_ASSIGNED",
    "OUT_FOR_DELIVERY",
    "RETURNED_TO_MERCHANT",
    "ON_HOLD",
  ];

  if (KEY_STATUSES_FOR_MERCHANT.includes(payload.status)) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: parcel.merchantId },
      select: { userId: true },
    });

    if (merchant) {
      await notificationServices.sendNotification(
        merchant.userId,
        `Parcel status updated to ${payload.status}`,
        `Your parcel (${parcel.id}) status has been updated to ${payload.status}.`,
      );
    }
  }

  return updatedParcel;
};

const cancelParcelByMerchant = async (
  parcelId: string,
  payload: CancelParcelByMerchantPayload,
  userId: string,
) => {
  // check if parcel exists
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    select: {
      id: true,
      status: true,
      merchantId: true,
      originHubId: true,
      destinationHubId: true,
      merchant: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  if (parcel.merchant.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to cancel this parcel",
    );
  }

  // only allow cancellation if parcel is in REQUESTED
  if (parcel.status !== "REQUESTED") {
    throw new AppError(
      status.BAD_REQUEST,
      "Only parcels in REQUESTED status can be cancelled",
    );
  }

  // data to be updated
  const data: Record<string, unknown> = {
    status: "CANCELLED",
    cancelledById: userId,
    cancelledAt: new Date(),
  };

  if (payload.cancellationReason) {
    data.cancellationReason = payload.cancellationReason;
  }

  // update the parcel and add a tracking log for the cancellation
  const updatedParcel = await prisma.$transaction(async (tx) => {
    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data,
    });

    await tx.trackingLog.create({
      data: {
        parcelId: parcelId,
        userId: userId,
        status: "CANCELLED",
        hubId: parcel.originHubId ?? undefined,
        description: `Parcel cancelled by merchant. Reason: ${payload.cancellationReason || "No reason provided"}`,
      },
    });

    return updated;
  });

  await notificationServices.sendNotification(
    parcel.merchant.userId,
    "Parcel cancelled",
    `Your parcel has been cancelled. Tracking ID: ${parcel.id}`,
  );

  return updatedParcel;
};

const updateParcelStatusByRider = async (
  parcelId: string,
  userId: string,
  payload: UpdateParcelStatusByRiderPayload,
) => {
  // check if parcel exists
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
    select: {
      id: true,
      status: true,
      pickupRiderId: true,
      deliveryRiderId: true,
      originHubId: true,
      destinationHubId: true,
    },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  // validate the rider exists
  const rider = await prisma.rider.findUnique({
    where: { userId: userId },
    select: { id: true },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  // validate allowed status transitions for riders
  const ALLOWED_TRANSITIONS_FOR_RIDERS: Record<string, string[]> = {
    PICKUP_RIDER_ASSIGNED: ["PICKED_UP", "PICKUP_FAILED"],
    OUT_FOR_DELIVERY: ["DELIVERY_FAILED"],
  };

  const currentStatus = parcel.status as ParcelStatus;

  if (
    !ALLOWED_TRANSITIONS_FOR_RIDERS[currentStatus]?.includes(payload.status)
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      `Invalid status transition from ${currentStatus} to ${payload.status} for riders`,
    );
  }

  // validate rider ownership for pickup
  if (payload.status === "PICKED_UP" || payload.status === "PICKUP_FAILED") {
    if (parcel.pickupRiderId !== rider.id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not assigned as the pickup rider for this parcel",
      );
    }
  }

  // ensure pickup failed reason is provided if status is being updated to PICKUP_FAILED
  if (payload.status === "PICKUP_FAILED" && !payload.pickupFailedReason) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pickup failed reason is required when updating status to PICKUP_FAILED",
    );
  }

  // validate rider ownership for delivery
  if (payload.status === "DELIVERY_FAILED") {
    if (parcel.deliveryRiderId !== rider.id) {
      throw new AppError(
        status.FORBIDDEN,
        "You are not assigned as the delivery rider for this parcel",
      );
    }
  }

  // ensure delivery failed reason is provided if status is being updated to DELIVERY_FAILED
  if (payload.status === "DELIVERY_FAILED" && !payload.deliveryFailedReason) {
    throw new AppError(
      status.BAD_REQUEST,
      "Delivery failed reason is required when updating status to DELIVERY_FAILED",
    );
  }

  // ensure pickup failed reason is provided if status is being updated to PICKUP_FAILED
  if (payload.status === "PICKUP_FAILED" && !payload.pickupFailedReason) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pickup failed reason is required when updating status to PICKUP_FAILED",
    );
  }

  // ensure delivery failed reason is provided if status is being updated to DELIVERY_FAILED
  if (payload.status === "DELIVERY_FAILED" && !payload.deliveryFailedReason) {
    throw new AppError(
      status.BAD_REQUEST,
      "Delivery failed reason is required when updating status to DELIVERY_FAILED",
    );
  }

  const data: Record<string, unknown> = { status: payload.status };

  if (payload.pickupFailedReason) {
    data.pickupFailedReason = payload.pickupFailedReason;
  }

  if (payload.deliveryFailedReason) {
    data.deliveryFailedReason = payload.deliveryFailedReason;
  }

  // update the parcel and add a tracking log for the status change
  const updatedParcel = await prisma.$transaction(async (tx) => {
    const updated = await tx.parcel.update({
      where: { id: parcelId },
      data,
    });

    await tx.trackingLog.create({
      data: {
        parcelId: parcelId,
        userId: userId,
        status: payload.status,
        hubId: resolveHubIdForStatus(payload.status, {
          originHubId: parcel.originHubId,
          destinationHubId: parcel.destinationHubId,
        }),
        description: `Parcel status updated to ${payload.status} by rider. ${
          payload.pickupFailedReason || payload.deliveryFailedReason
        }`,
      },
    });

    return updated;
  });

  if (
    payload.status === "PICKUP_FAILED" ||
    payload.status === "DELIVERY_FAILED"
  ) {
    await notificationServices.sendNotification(
      userId,
      "Parcel cancellation/update notice",
      `You updated parcel status to ${payload.status}. Parcel ID: ${parcelId}`,
    );
  }

  return updatedParcel;
};

const sendDeliveryOTP = async (parcelId: string, userId: string) => {
  // check if parcel exists
  const parcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  // validate the rider exists
  const rider = await prisma.rider.findUnique({
    where: { userId: userId },
    select: { id: true },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  // ensure the rider is assigned as the delivery rider for this parcel
  if (parcel.deliveryRiderId !== rider.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not assigned as the delivery rider for this parcel",
    );
  }

  // ensure parcel is out for delivery
  if (parcel.status !== "OUT_FOR_DELIVERY") {
    throw new AppError(
      status.BAD_REQUEST,
      "OTP can only be sent for parcels that are out for delivery",
    );
  }

  // attache the otp to the parcel

  await prisma.parcel.update({
    where: { id: parcelId },
    data: {
      deliveryOtp: envVariables.DELIVERY_MASTER_OTP,
      deliveryOtpGeneratedAt: new Date(),
    },
  });
};

const verifyAndDeliverParcel = async (parcelId: string, otp: string) => {
  // check if parcel exists
  const existingParcel = await prisma.parcel.findUnique({
    where: { id: parcelId },
  });

  if (!existingParcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  // ensure parcel is out for delivery
  if (existingParcel.status !== "OUT_FOR_DELIVERY") {
    throw new AppError(
      status.BAD_REQUEST,
      "Parcel must be out for delivery to verify OTP",
    );
  }

  // check if the rider exists
  const rider = await prisma.rider.findUnique({
    where: { id: existingParcel.deliveryRiderId! },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Assigned delivery rider not found");
  }

  // ensure OTP matches
  if (existingParcel.deliveryOtp !== otp) {
    throw new AppError(status.BAD_REQUEST, "Invalid OTP");
  }

  // validate otp is not expired (valid for 30 minutes)
  const now = new Date();
  const otpGeneratedAt = existingParcel.deliveryOtpGeneratedAt;
  if (
    !otpGeneratedAt ||
    now.getTime() - otpGeneratedAt.getTime() >
      parseDurationToMs(envVariables.OTP_EXPIRATION_MINUTES)
  ) {
    // clear the expired OTP
    await prisma.parcel.update({
      where: { id: parcelId },
      data: {
        deliveryOtp: null,
        deliveryOtpGeneratedAt: null,
      },
    });
    throw new AppError(status.BAD_REQUEST, "OTP has expired");
  }

  // update parcel status to DELIVERED and clear the OTP and increment the merchant's balance by the COD
  await prisma.$transaction([
    // mark parcel as delivered and clear OTP
    prisma.parcel.update({
      where: { id: parcelId },
      data: {
        status: "DELIVERED",
        deliveryOtp: null,
        deliveryOtpGeneratedAt: null,
      },
    }),
    //  increment merchant balance by codAmount
    prisma.merchant.update({
      where: { id: existingParcel.merchantId },
      data: {
        balance: {
          increment: existingParcel.codAmount,
        },
      },
    }),

    // increment rider's cash in hand by codAmount
    prisma.rider.update({
      where: { id: existingParcel.deliveryRiderId! },
      data: {
        cashInHand: {
          increment: existingParcel.codAmount,
        },
      },
    }),

    // create a tracking log for delivery
    prisma.trackingLog.create({
      data: {
        parcelId: existingParcel.id,
        userId: rider.userId,
        status: "DELIVERED",
        hubId: existingParcel.destinationHubId ?? undefined,
        description: `Parcel delivered successfully. COD amount ${existingParcel.codAmount} BDT added to merchant balance and rider's cash in hand.`,
      },
    }),
  ]);

  const merchantUser = await prisma.merchant.findUnique({
    where: { id: existingParcel.merchantId },
    select: { userId: true },
  });

  if (merchantUser) {
    await notificationServices.sendNotification(
      merchantUser.userId,
      "Parcel delivered",
      `Your parcel has been delivered successfully. Parcel ID: ${existingParcel.id}`,
    );
  }
};

const getParcelHubTracking = async (trackingId: string) => {
  const parcel = await prisma.parcel.findUnique({
    where: { trackingId },
    select: {
      id: true,
      trackingId: true,
      status: true,
      originHub: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          contactNumber: true,
        },
      },
      destinationHub: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          contactNumber: true,
        },
      },
      trackingLogs: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          status: true,
          description: true,
          createdAt: true,
          userId: true,
          hubId: true,
          hub: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
              contactNumber: true,
            },
          },
        },
      },
    },
  });

  if (!parcel) {
    throw new AppError(status.NOT_FOUND, "Parcel not found");
  }

  const latestHubLog = [...parcel.trackingLogs]
    .reverse()
    .find((log) => !!log.hubId);

  return {
    parcelId: parcel.id,
    trackingId: parcel.trackingId,
    status: parcel.status,
    currentHub: latestHubLog?.hub ?? null,
    currentHubUpdatedAt: latestHubLog?.createdAt ?? null,
    originHub: parcel.originHub,
    destinationHub: parcel.destinationHub,
    trackingTimeline: parcel.trackingLogs,
  };
};

export const parcelServices = {
  getAllParcels,
  createParcel,
  updateParcel,
  updateParcelStatusByAdmin,
  cancelParcelByMerchant,
  updateParcelStatusByRider,
  sendDeliveryOTP,
  verifyAndDeliverParcel,
  getParcelHubTracking,
};
