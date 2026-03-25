import status from "http-status";
import AppError from "../../errors/app-error";
import { prisma } from "../../libs/prisma";
import { CollectCashPayload } from "./validators";

export const collectCash = async (
  userId: string,
  riderId: string,
  payload: CollectCashPayload,
) => {
  // check rider exists
  const rider = await prisma.rider.findUnique({
    where: {
      id: riderId,
    },
    select: {
      cashInHand: true,
    },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider not found");
  }

  // ensure rider has enough cash to collect
  if (Number(rider.cashInHand) < payload.amount) {
    throw new AppError(
      status.BAD_REQUEST,
      `Rider only has ${rider.cashInHand} BDT in hand. Cannot collect ${payload.amount} BDT.`,
    );
  }

  // prevent collecting more cash than the rider has in hand
  if (payload.amount > Number(rider.cashInHand)) {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot collect ${payload.amount} BDT. Rider only has ${rider.cashInHand} BDT in hand.`,
    );
  }

  // fetch the admin (hub manager) performing the collection for record-keeping
  const admin = await prisma.admin.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      managedHubs: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin (hub manager) not found");
  }

  const managedHubId = admin.managedHubs[0]?.id;

  if (!managedHubId) {
    throw new AppError(
      status.BAD_REQUEST,
      "No hub is assigned to this admin (hub manager)",
    );
  }

  // atomic transaction
  await prisma.$transaction(async (tx) => {
    // decrement rider's cash in hand
    await tx.rider.update({
      where: {
        id: riderId,
      },
      data: {
        cashInHand: {
          decrement: payload.amount,
        },
      },
    });
    // create cash collection record
    await tx.cashCollection.create({
      data: {
        amount: payload.amount,
        riderId,
        adminId: admin.id,
        hubId: managedHubId,
        createdAt: new Date(),
      },
    });
  });
};

export const cashCollectionServices = {
  collectCash,
};
