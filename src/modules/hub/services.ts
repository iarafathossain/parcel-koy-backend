import status from "http-status";
import AppError from "../../errors/app-error";
import { IQueryParams } from "../../interfaces/query-type";
import { prisma } from "../../libs/prisma";
import { getSlug } from "../../utils/get-slug";
import { QueryBuilder } from "../../utils/query-builder";
import { CreateHubPayload, UpdateHubPayload } from "./validators";

const getDateRangeByKey = (dateKey?: string) => {
  const now = new Date();

  if (!dateKey || dateKey.toLowerCase() === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return {
      key: "today",
      start,
      end,
    };
  }

  throw new AppError(
    status.BAD_REQUEST,
    "Invalid date filter. Supported value: today",
  );
};

const createHub = async (payload: CreateHubPayload) => {
  const slug = getSlug(payload.name);

  // validate if hub with same slug already exists
  const existingHub = await prisma.hub.findUnique({
    where: {
      slug,
    },
  });

  if (existingHub) {
    throw new AppError(
      status.BAD_REQUEST,
      "A hub with the same name already exists",
    );
  }

  // validate if manager exists before creating hub
  if (payload.managerId) {
    const manager = await prisma.admin.findUnique({
      where: {
        id: payload.managerId,
      },
    });

    if (!manager) {
      throw new AppError(status.BAD_REQUEST, "Manager not found");
    }
  }

  const hub = await prisma.hub.create({
    data: {
      name: payload.name,
      slug,
      address: payload.address,
      contactNumber: payload.contactNumber,
      managerId: payload.managerId ?? undefined,
      isActive: payload.isActive ?? true,
    },
    include: {
      manager: true,
    },
  });

  return hub;
};

const getAllHubs = async (queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.hub, queryParams, {
    searchableFields: ["name", "slug", "address", "contactNumber"],
    filterableFields: ["name", "slug", "managerId", "isActive"],
  })
    .search()
    .filter()
    .sort()
    .fields()
    .dynamicInclude(
      {
        coverageAreas: true,
        manager: true,
      },
      ["coverageAreas", "manager"],
    )
    .paginate();

  return await queryBuilder.execute();
};

const getHubBySlug = async (slug: string, queryParams: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.hub, queryParams)
    .where({ slug })
    .fields()
    .dynamicInclude(
      {
        coverageAreas: true,
        manager: true,
      },
      ["coverageAreas", "manager"],
    );

  const hubs = await prisma.hub.findMany(
    queryBuilder.getQuery() as Parameters<typeof prisma.hub.findMany>[0],
  );

  return hubs[0] ?? null;
};

const updateHub = async (slug: string, payload: UpdateHubPayload) => {
  const updateData: Record<string, unknown> = {};

  if (payload.name) {
    updateData.name = payload.name;
    updateData.slug = getSlug(payload.name);
  }

  if (payload.address) {
    updateData.address = payload.address;
  }

  if (payload.contactNumber) {
    updateData.contactNumber = payload.contactNumber;
  }

  if (payload.managerId !== undefined) {
    updateData.managerId = payload.managerId;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive;
  }

  const hub = await prisma.hub.update({
    where: {
      slug,
    },
    data: updateData,
    include: {
      manager: true,
    },
  });

  return hub;
};

const getHubCashCollections = async (hubId: string, dateKey?: string) => {
  const hub = await prisma.hub.findUnique({
    where: {
      id: hubId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!hub) {
    throw new AppError(status.NOT_FOUND, "Hub not found");
  }

  const dateRange = getDateRangeByKey(dateKey);

  const whereCondition = {
    hubId,
    createdAt: {
      gte: dateRange.start,
      lte: dateRange.end,
    },
  };

  const [cashCollections, aggregate] = await Promise.all([
    prisma.cashCollection.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        rider: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                contactNumber: true,
              },
            },
          },
        },
        admin: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.cashCollection.aggregate({
      where: whereCondition,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  return {
    hub,
    date: dateRange.key,
    dateRange: {
      start: dateRange.start,
      end: dateRange.end,
    },
    totalAmount: Number(aggregate._sum.amount ?? 0),
    totalCollections: aggregate._count.id,
    cashCollections,
  };
};

const deleteHub = async (slug: string) => {
  // validate if hub exists before attempting to delete
  const existingHub = await prisma.hub.findUnique({
    where: {
      slug,
    },
  });

  if (!existingHub) {
    throw new AppError(status.NOT_FOUND, "Hub not found");
  }

  const hub = await prisma.hub.delete({
    where: {
      slug,
    },
  });

  return hub;
};

export const hubService = {
  createHub,
  getAllHubs,
  getHubBySlug,
  updateHub,
  deleteHub,
  getHubCashCollections,
};
