import status from "http-status";
import Stripe from "stripe";
import { envVariables } from "../../config/env";
import AppError from "../../errors/app-error";
import { Prisma } from "../../generated/prisma/client";
import { PayoutStatus } from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/auth-type";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { QueryBuilder } from "../../utils/query-builder";
import { notificationServices } from "../notification/services";
import { RequestPayoutPayload } from "./validators";

const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET_KEY);

const getAllPendingPayout = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(
    prisma.payout,
    {
      ...queryParams,
      status: PayoutStatus.PENDING,
    },
    {
      searchableFields: [
        "merchant.businessName",
        "merchant.user.name",
        "transactionId",
      ],
      filterableFields: ["merchantId", "paymentAccountId", "status"],
    },
  )
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        merchant: {
          include: {
            user: true,
          },
        },
        paymentAccount: true,
      },
      ["merchant", "paymentAccount"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const createPayoutRequest = async (
  currentUser: IRequestUser,
  payload: RequestPayoutPayload,
) => {
  const { amount } = payload;

  // 1. Find the merchant
  const merchant = await prisma.merchant.findUnique({
    where: { userId: currentUser.userId },
  });

  if (!merchant) throw new AppError(status.NOT_FOUND, "Merchant not found");

  // 2. Check if the merchant has enough balance
  if (Number(merchant.balance) < amount) {
    throw new AppError(status.BAD_REQUEST, "Insufficient platform balance");
  }

  // 3. Find their active Stripe Connect payment account
  const paymentAccount = await prisma.paymentAccount.findFirst({
    where: {
      merchantId: merchant.id,
      isActive: true, // Must have finished Stripe onboarding
    },
  });

  if (!paymentAccount) {
    throw new AppError(
      status.BAD_REQUEST,
      "No active Stripe account found. Please complete payment onboarding first.",
    );
  }

  // 4. Execute a Database Transaction (Create Payout + Deduct Balance)
  const payout = await prisma.$transaction(async (tx) => {
    // A. Create the Pending Payout record
    const newPayout = await tx.payout.create({
      data: {
        merchantId: merchant.id,
        paymentAccountId: paymentAccount.id,
        amount: amount,
        status: PayoutStatus.PENDING,
      },
    });

    // B. Deduct the amount from the merchant's balance immediately
    await tx.merchant.update({
      where: { id: merchant.id },
      data: {
        balance: { decrement: amount },
      },
    });

    return newPayout;
  });

  // Find the hub manager of the merchant's origin area
  const originArea = await prisma.area.findUnique({
    where: { id: merchant.originAreaId || "" },
    select: { hubID: true },
  });

  if (originArea?.hubID) {
    const hubManager = await prisma.admin.findFirst({
      where: {
        managedHubs: {
          some: {
            id: originArea.hubID,
          },
        },
      },
      select: { userId: true },
    });

    if (hubManager) {
      await notificationServices.sendNotification(
        hubManager.userId,
        "New Payout Request",
        `${merchant.businessName} has requested a payout of ${amount} BDT.`,
      );
    }
  }

  return payout;
};

const processStripePayout = async (payoutId: string) => {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: {
      merchant: true,
      paymentAccount: true,
    },
  });

  if (!payout) throw new AppError(status.NOT_FOUND, "Payout not found");
  if (payout.status !== PayoutStatus.PENDING)
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending payouts can be processed",
    );

  if (!payout.paymentAccount.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      "Merchant's Stripe account is inactive or onboarding is incomplete.",
    );
  }

  const amountInSmallestUnit = Math.round(Number(payout.amount) * 100);

  if (amountInSmallestUnit <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payout amount must be greater than zero",
    );
  }

  try {
    // 1. Transfer funds from your platform balance to the Merchant's Connected Account
    const transfer = await stripe.transfers.create({
      amount: amountInSmallestUnit,
      currency: "bdt",
      destination: payout.paymentAccount.stripeConnectAccountId,
      metadata: {
        payoutId: payout.id,
        merchantId: payout.merchantId,
      },
      description: `Payout for ${payout.merchant.businessName}`,
    });

    // 2. Mark Payout as completed immediately (Synchronous execution)
    const updatedPayout = await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: PayoutStatus.COMPLETED,
        transactionId: transfer.id,
        paymentGatewayData: transfer as unknown as Prisma.InputJsonValue,
      },
    });

    // NOTIFICATION INJECTION: Notify Merchant of Success
    await notificationServices.sendNotification(
      payout.merchant.userId,
      "Payout Successful",
      `Your payout request for $${payout.amount} has been successfully transferred to your bank.`,
    );

    return {
      payoutId: updatedPayout.id,
      transferId: transfer.id,
      status: updatedPayout.status,
    };
  } catch (error: any) {
    console.error("Stripe Transfer Failed:", error);

    // If Stripe fails (e.g. insufficient platform funds), reject payout & refund the merchant's platform balance
    await prisma.$transaction(async (tx) => {
      await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.REJECTED,
          adminNote: `Stripe Transfer Failed: ${error.message}`,
        },
      });

      await tx.merchant.update({
        where: { id: payout.merchantId },
        data: { balance: { increment: payout.amount } },
      });
    });

    // NOTIFICATION INJECTION: Notify Merchant of Failure
    await notificationServices.sendNotification(
      payout.merchant.userId,
      "Payout Failed",
      `Your payout request for $${payout.amount} failed. The funds have been returned to your platform balance.`,
    );

    throw new AppError(status.BAD_GATEWAY, `Transfer failed: ${error.message}`);
  }
};

export const payoutService = {
  getAllPendingPayout,
  createPayoutRequest,
  processStripePayout,
};
