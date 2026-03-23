import status from "http-status";
import AppError from "../../errors/app-error";
import { ParcelStatus } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import { generateTrackingID } from "../../utils/generate-tracking-id";
import {
  CancelParcelByMerchantPayload,
  CreateParcelPayload,
  UpdateParcelPayload,
  UpdateParcelStatusByAdminPayload,
} from "./validators";

const createParcel = async (payload: CreateParcelPayload, userId: string) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: userId },
    select: { id: true, originAreaId: true, pickupAddress: true },
  });

  if (!merchant) {
    throw new AppError(status.BAD_REQUEST, "Merchant not found");
  }
  const merchantOriginAreaId = merchant.originAreaId;
  const merchantPickupAddress = merchant.pickupAddress;

  const trackingID = generateTrackingID();

  const method = await prisma.method.findUnique({
    where: { id: payload.methodId },
    select: { baseFee: true, slug: true },
  });

  if (!method) {
    throw new AppError(status.BAD_REQUEST, "Invalid delivery method selected");
  }

  // if method is "pick & drop", originAreaId is required, otherwise use merchant's origin area
  const originAreaId =
    method.slug === "pick-drop" ? payload.originAreaId : merchantOriginAreaId;

  const pickupAddress =
    method.slug === "pick-drop" ? payload.pickupAddress : merchantPickupAddress;

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

  if (payload.declaredWeight < baseCategoryWeight.baseWeight) {
    throw new AppError(
      status.BAD_REQUEST,
      `Declared weight must be at least ${baseCategoryWeight.baseWeight} kg for category ${baseCategoryWeight.slug}`,
    );
  }

  const deliveryCharge = await prisma.pricing.findFirst({
    where: {
      originalZoneId: originArea?.zoneId,
      destinationZoneId: destinationArea?.zoneId,
      speedId: payload.speedId,
      methodId: payload.methodId,
      categoryId: payload.categoryId,
      minWeight: { lte: payload.declaredWeight },
      maxWeight: { gte: payload.declaredWeight },
    },
    select: { price: true },
  });

  if (!deliveryCharge) {
    throw new AppError(
      status.BAD_REQUEST,
      "No pricing found for the given parameters. Please contact support.",
    );
  }

  // create the parcel
  const parcel = await prisma.parcel.create({
    data: {
      trackingId: trackingID,
      merchantId: merchant.id,
      categoryId: payload.categoryId,
      destinationAreaId: payload.destinationAreaId,
      originAreaId: originAreaId,
      originHubId: originArea.hubID,
      destinationHubId: destinationArea.hubID,
      speedId: payload.speedId,
      methodId: payload.methodId,
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

  return parcel;
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
  if (payload.methodId) {
    const method = await prisma.method.findUnique({
      where: { id: payload.methodId },
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
    payload.methodId ||
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
        methodId: payload.methodId || parcel.methodId,
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

  const updatedParcel = await prisma.parcel.update({
    where: { id: parcelId },
    data,
  });

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

  const updatedParcel = await prisma.parcel.update({
    where: { id: parcelId },
    data,
  });

  return updatedParcel;
};

export const parcelServices = {
  createParcel,
  updateParcel,
  updateParcelStatusByAdmin,
  cancelParcelByMerchant,
};
