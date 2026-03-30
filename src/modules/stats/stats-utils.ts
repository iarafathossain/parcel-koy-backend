import { Prisma } from "../../generated/prisma/client";
import { ParcelStatus } from "../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mergeWhere = (
  baseWhere: Prisma.ParcelWhereInput | undefined,
  additionalWhere: Prisma.ParcelWhereInput,
): Prisma.ParcelWhereInput => {
  if (!baseWhere) {
    return additionalWhere;
  }

  return {
    AND: [baseWhere, additionalWhere],
  };
};

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const safeCountIfTableMissing = async (query: Promise<number>) => {
  try {
    return await query;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return 0;
    }

    throw error;
  }
};

const getStatusCountTemplate = (): Record<ParcelStatus, number> => {
  const template = {} as Record<ParcelStatus, number>;

  for (const status of Object.values(ParcelStatus)) {
    template[status] = 0;
  }

  return template;
};

const getTotalCount = async () => {
  const [
    users,
    sessions,
    accounts,
    merchants,
    riders,
    admins,
    hubs,
    zones,
    areas,
    categories,
    methods,
    speeds,
    pricing,
    parcels,
    trackingLogs,
    notes,
    notifications,
    cashCollections,
    paymentAccounts,
    payouts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.session.count(),
    prisma.account.count(),
    prisma.merchant.count(),
    prisma.rider.count(),
    prisma.admin.count(),
    prisma.hub.count(),
    prisma.zone.count(),
    prisma.area.count(),
    prisma.category.count(),
    prisma.method.count(),
    prisma.speed.count(),
    prisma.pricing.count(),
    prisma.parcel.count(),
    prisma.trackingLog.count(),
    prisma.note.count(),
    safeCountIfTableMissing(prisma.notification.count()),
    prisma.cashCollection.count(),
    prisma.paymentAccount.count(),
    prisma.payout.count(),
  ]);

  return {
    users,
    sessions,
    accounts,
    merchants,
    riders,
    admins,
    hubs,
    zones,
    areas,
    categories,
    methods,
    speeds,
    pricing,
    parcels,
    trackingLogs,
    notes,
    notifications,
    cashCollections,
    paymentAccounts,
    payouts,
  };
};

const getParcelStatusSummary = async (where?: Prisma.ParcelWhereInput) => {
  const groupedStatuses = await prisma.parcel.groupBy({
    by: ["status"],
    where,
    _count: {
      _all: true,
    },
  });

  const summary = getStatusCountTemplate();

  for (const item of groupedStatuses) {
    summary[item.status] = item._count._all;
  }

  return summary;
};

const getPieChartData = async (where?: Prisma.ParcelWhereInput) => {
  const statusSummary = await getParcelStatusSummary(where);

  const data = Object.entries(statusSummary)
    .map(([status, value]) => ({
      status,
      value,
    }))
    .filter((item) => item.value > 0);

  return {
    data,
    total: data.reduce((sum, item) => sum + item.value, 0),
  };
};

const getBarChartData = async (where?: Prisma.ParcelWhereInput, days = 7) => {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const parcels = await prisma.parcel.findMany({
    where: mergeWhere(where, { createdAt: { gte: start } }),
    select: {
      createdAt: true,
      status: true,
    },
  });

  const buckets: Record<
    string,
    {
      date: string;
      total: number;
      delivered: number;
      cancelled: number;
      failed: number;
    }
  > = {};

  for (let day = 0; day < days; day += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const key = formatDate(date);

    buckets[key] = {
      date: key,
      total: 0,
      delivered: 0,
      cancelled: 0,
      failed: 0,
    };
  }

  for (const parcel of parcels) {
    const dateKey = formatDate(parcel.createdAt);
    const bucket = buckets[dateKey];

    if (!bucket) {
      continue;
    }

    bucket.total += 1;

    if (parcel.status === ParcelStatus.DELIVERED) {
      bucket.delivered += 1;
    }

    if (parcel.status === ParcelStatus.CANCELLED) {
      bucket.cancelled += 1;
    }

    if (
      parcel.status === ParcelStatus.PICKUP_FAILED ||
      parcel.status === ParcelStatus.DELIVERY_FAILED
    ) {
      bucket.failed += 1;
    }
  }

  return {
    data: Object.values(buckets),
  };
};

const getParcelFinancialSummary = async (where?: Prisma.ParcelWhereInput) => {
  const [total, delivered] = await Promise.all([
    prisma.parcel.aggregate({
      where,
      _sum: {
        codAmount: true,
        deliveryCharge: true,
      },
    }),
    prisma.parcel.aggregate({
      where: mergeWhere(where, { status: ParcelStatus.DELIVERED }),
      _sum: {
        codAmount: true,
      },
    }),
  ]);

  return {
    totalCodAmount: toNumber(total._sum.codAmount),
    totalDeliveryCharge: toNumber(total._sum.deliveryCharge),
    deliveredCodAmount: toNumber(delivered._sum.codAmount),
  };
};

export {
  getBarChartData,
  getParcelFinancialSummary,
  getParcelStatusSummary,
  getPieChartData,
  getTotalCount,
  mergeWhere,
  toNumber,
};
