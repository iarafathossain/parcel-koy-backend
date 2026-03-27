import status from "http-status";
import AppError from "../../errors/app-error";
import { Prisma } from "../../generated/prisma/client";
import {
  ParcelStatus,
  PayoutStatus,
  Role,
  UserStatus,
} from "../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/auth-type";
import { prisma } from "../../libs/prisma";
import {
  getBarChartData,
  getParcelFinancialSummary,
  getParcelStatusSummary,
  getPieChartData,
  getTotalCount,
  mergeWhere,
  toNumber,
} from "./stats-utils";

const getDashboardStats = async (user: IRequestUser) => {
  let stats;

  switch (user.role) {
    case Role.SUPER_ADMIN:
      stats = await getSuperAdminStats();
      break;
    case Role.ADMIN:
      stats = await getAdminStats(user);
      break;
    case Role.MERCHANT:
      stats = await getMerchantStats(user);
      break;
    case Role.RIDER:
      stats = await getRiderStats(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }

  return stats;
};

const getSuperAdminStats = async () => {
  const [
    systemOverview,
    totalParcels,
    inProgressParcels,
    parcelStatusSummary,
    financialSummary,
    pieChart,
    barChart,
    totalMerchantBalance,
    totalRiderCashInHand,
    totalCashCollection,
    pendingPayouts,
    completedPayouts,
    activeUsers,
    blockedUsers,
  ] = await Promise.all([
    getTotalCount(),
    prisma.parcel.count(),
    prisma.parcel.count({
      where: {
        status: {
          notIn: [
            ParcelStatus.DELIVERED,
            ParcelStatus.CANCELLED,
            ParcelStatus.RETURNED_TO_MERCHANT,
          ],
        },
      },
    }),
    getParcelStatusSummary(),
    getParcelFinancialSummary(),
    getPieChartData(),
    getBarChartData(),
    prisma.merchant.aggregate({
      _sum: { balance: true },
    }),
    prisma.rider.aggregate({
      _sum: { cashInHand: true },
    }),
    prisma.cashCollection.aggregate({
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { status: PayoutStatus.PENDING },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { status: PayoutStatus.COMPLETED },
      _sum: { amount: true },
    }),
    prisma.user.count({
      where: { status: UserStatus.ACTIVE, isDeleted: false },
    }),
    prisma.user.count({
      where: { status: UserStatus.BLOCKED, isDeleted: false },
    }),
  ]);

  return {
    role: Role.SUPER_ADMIN,
    scope: "system",
    overview: systemOverview,
    users: {
      active: activeUsers,
      blocked: blockedUsers,
    },
    parcels: {
      total: totalParcels,
      inProgress: inProgressParcels,
      byStatus: parcelStatusSummary,
    },
    financials: {
      ...financialSummary,
      totalMerchantBalance: toNumber(totalMerchantBalance._sum.balance),
      totalRiderCashInHand: toNumber(totalRiderCashInHand._sum.cashInHand),
      totalCashCollection: toNumber(totalCashCollection._sum.amount),
      pendingPayoutAmount: toNumber(pendingPayouts._sum.amount),
      completedPayoutAmount: toNumber(completedPayouts._sum.amount),
    },
    charts: {
      pie: pieChart,
      bar: barChart,
    },
  };
};

const getAdminStats = async (user: IRequestUser) => {
  const admin = await prisma.admin.findUnique({
    where: { userId: user.userId },
    include: {
      managedHubs: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const managedHubIds = admin?.managedHubs.map((hub) => hub.id) ?? [];

  const parcelWhere: Prisma.ParcelWhereInput | undefined = managedHubIds.length
    ? {
        OR: [
          { originHubId: { in: managedHubIds } },
          { destinationHubId: { in: managedHubIds } },
        ],
      }
    : undefined;

  const [
    scopedParcelCount,
    scopedStatusSummary,
    scopedFinancialSummary,
    pieChart,
    barChart,
    scopedRiders,
    scopedCashCollection,
    scopedTrackingLogs,
    scopedNotes,
  ] = await Promise.all([
    prisma.parcel.count({ where: parcelWhere }),
    getParcelStatusSummary(parcelWhere),
    getParcelFinancialSummary(parcelWhere),
    getPieChartData(parcelWhere),
    getBarChartData(parcelWhere),
    prisma.rider.count({
      where: managedHubIds.length
        ? { hubId: { in: managedHubIds } }
        : undefined,
    }),
    prisma.cashCollection.aggregate({
      where: managedHubIds.length
        ? { hubId: { in: managedHubIds } }
        : undefined,
      _sum: { amount: true },
    }),
    prisma.trackingLog.count({
      where: managedHubIds.length
        ? { hubId: { in: managedHubIds } }
        : undefined,
    }),
    prisma.note.count({
      where: managedHubIds.length
        ? {
            parcel: parcelWhere,
          }
        : undefined,
    }),
  ]);

  return {
    role: Role.ADMIN,
    scope: managedHubIds.length ? "managed-hubs" : "system",
    managedHubs: admin?.managedHubs ?? [],
    parcels: {
      total: scopedParcelCount,
      byStatus: scopedStatusSummary,
    },
    operations: {
      riders: scopedRiders,
      trackingLogs: scopedTrackingLogs,
      notes: scopedNotes,
    },
    financials: {
      ...scopedFinancialSummary,
      totalCashCollection: toNumber(scopedCashCollection._sum.amount),
    },
    charts: {
      pie: pieChart,
      bar: barChart,
    },
  };
};

const getMerchantStats = async (user: IRequestUser) => {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
      businessName: true,
      balance: true,
      creditLimit: true,
    },
  });

  if (!merchant) {
    throw new AppError(status.NOT_FOUND, "Merchant profile not found");
  }

  const parcelWhere: Prisma.ParcelWhereInput = { merchantId: merchant.id };

  const [
    totalParcels,
    byStatus,
    financialSummary,
    pieChart,
    barChart,
    activePaymentAccounts,
    pendingPayout,
    completedPayout,
  ] = await Promise.all([
    prisma.parcel.count({ where: parcelWhere }),
    getParcelStatusSummary(parcelWhere),
    getParcelFinancialSummary(parcelWhere),
    getPieChartData(parcelWhere),
    getBarChartData(parcelWhere),
    prisma.paymentAccount.count({
      where: { merchantId: merchant.id, isActive: true },
    }),
    prisma.payout.aggregate({
      where: { merchantId: merchant.id, status: PayoutStatus.PENDING },
      _sum: { amount: true },
    }),
    prisma.payout.aggregate({
      where: { merchantId: merchant.id, status: PayoutStatus.COMPLETED },
      _sum: { amount: true },
    }),
  ]);

  return {
    role: Role.MERCHANT,
    scope: "self",
    merchant: {
      businessName: merchant.businessName,
      balance: toNumber(merchant.balance),
      creditLimit: toNumber(merchant.creditLimit),
      activePaymentAccounts,
    },
    parcels: {
      total: totalParcels,
      byStatus,
    },
    financials: {
      ...financialSummary,
      pendingPayoutAmount: toNumber(pendingPayout._sum.amount),
      completedPayoutAmount: toNumber(completedPayout._sum.amount),
    },
    charts: {
      pie: pieChart,
      bar: barChart,
    },
  };
};

const getRiderStats = async (user: IRequestUser) => {
  const rider = await prisma.rider.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
      hubId: true,
      cashInHand: true,
    },
  });

  if (!rider) {
    throw new AppError(status.NOT_FOUND, "Rider profile not found");
  }

  const parcelWhere: Prisma.ParcelWhereInput = {
    OR: [{ pickupRiderId: rider.id }, { deliveryRiderId: rider.id }],
  };

  const [
    parcelCount,
    byStatus,
    financialSummary,
    pieChart,
    barChart,
    pickupCount,
    deliveryCount,
    deliveredCount,
    collectionSummary,
  ] = await Promise.all([
    prisma.parcel.count({ where: parcelWhere }),
    getParcelStatusSummary(parcelWhere),
    getParcelFinancialSummary(parcelWhere),
    getPieChartData(parcelWhere),
    getBarChartData(parcelWhere),
    prisma.parcel.count({ where: { pickupRiderId: rider.id } }),
    prisma.parcel.count({ where: { deliveryRiderId: rider.id } }),
    prisma.parcel.count({
      where: mergeWhere(
        { deliveryRiderId: rider.id },
        { status: ParcelStatus.DELIVERED },
      ),
    }),
    prisma.cashCollection.aggregate({
      where: { riderId: rider.id },
      _sum: { amount: true },
    }),
  ]);

  return {
    role: Role.RIDER,
    scope: "self",
    rider: {
      hubId: rider.hubId,
      cashInHand: toNumber(rider.cashInHand),
    },
    parcels: {
      total: parcelCount,
      pickups: pickupCount,
      deliveries: deliveryCount,
      delivered: deliveredCount,
      byStatus,
    },
    financials: {
      ...financialSummary,
      totalCollectedCash: toNumber(collectionSummary._sum.amount),
    },
    charts: {
      pie: pieChart,
      bar: barChart,
    },
  };
};

export const statsService = {
  getDashboardStats,
};
