import status from "http-status";
import AppError from "../../errors/app-error";
import { prisma } from "../../libs/prisma";
import { generateTrackingID } from "../../utils/generate-tracking-id";
import { CreateParcelPayload } from "./validators";

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
      notes: payload.notes,
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
export const parcelServices = {
  createParcel,
};
